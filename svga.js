/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 */
var SVGA;
(function (SVGA) {
    var Converter = (function () {
        function Converter(app) {
            this.app = undefined;
            this.proj = undefined;
            this.res = [];
            this.layers = [];
            this.app = app;
            this.loadProj();
            this.loadRes();
            this.loadLayer();
        }
        Converter.prototype.loadProj = function () {
            this.proj = {
                name: this.app.project.activeItem.name,
                width: this.app.project.activeItem.width,
                height: this.app.project.activeItem.height,
                frameRate: this.app.project.activeItem.frameRate,
                frameCount: this.app.project.activeItem.frameRate * this.app.project.activeItem.duration
            };
        };
        Converter.prototype.loadRes = function () {
            var layers = this.app.project.activeItem.layers;
            for (var i = 1; i <= layers.length; i++) {
                var element = layers[i];
                this.res.push({
                    name: element.source.name,
                    path: element.source.path
                });
            }
        };
        Converter.prototype.loadLayer = function () {
            var layers = this.app.project.activeItem.layers;
            for (var i = 1; i <= layers.length; i++) {
                var element = layers[i];
                this.layers.push({
                    name: element.source.name,
                    values: {
                        alpha: this.requestValue(element.transform.opacity),
                        matrix: this.requestMatrix(element.transform, element.width, element.height)
                    }
                });
            }
        };
        Converter.prototype.requestValue = function (prop) {
            var value = [];
            var step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                value.push(prop.valueAtTime(cTime, true));
            }
            return value;
        };
        Converter.prototype.requestMatrix = function (transform, width, height) {
            var value = [];
            var step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                var rotation = transform["Rotation"].valueAtTime(cTime, true);
                var sx = transform["Scale"].valueAtTime(cTime, true)[0] / 100.0;
                var sy = transform["Scale"].valueAtTime(cTime, true)[1] / 100.0;
                var tx = transform["Position"].valueAtTime(cTime, true)[0];
                var ty = transform["Position"].valueAtTime(cTime, true)[1];
                var matrix = new Matrix();
                matrix.reset().rotate(rotation).scale(sx, sy);
                this.convertMatrix(matrix, tx, ty, 0, 0, width, height);
                value.push({
                    a: matrix.props[0],
                    b: matrix.props[1],
                    c: matrix.props[4],
                    d: matrix.props[5],
                    tx: matrix.props[12],
                    ty: matrix.props[13]
                });
            }
            return value;
        };
        Converter.prototype.convertMatrix = function (matrix, mtx, mty, x, y, width, height) {
            var a = matrix.props[0];
            var b = matrix.props[1];
            var c = matrix.props[4];
            var d = matrix.props[5];
            var tx = matrix.props[12];
            var ty = matrix.props[13];
            var llx = a * x + c * y + tx;
            var lrx = a * (x + width) + c * y + tx;
            var lbx = a * x + c * (y + height) + tx;
            var rbx = a * (x + width) + c * (y + height) + tx;
            var lly = b * x + d * y + ty;
            var lry = b * (x + width) + d * y + ty;
            var lby = b * x + d * (y + height) + ty;
            var rby = b * (x + width) + d * (y + height) + ty;
            var nx = Math.min(lbx, rbx, llx, lrx);
            var ny = Math.min(lby, rby, lly, lry);
            matrix.translate(mtx - nx / 2.0, mty - ny / 2.0);
        };
        return Converter;
    }());
    SVGA.Converter = Converter;
})(SVGA || (SVGA = {}));
var converter = new SVGA.Converter(app);
$.write(converter.layers[71].values.matrix[0].a);

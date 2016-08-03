/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 * Build: npm install & npm start
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
            this.loadRes(app.project.activeItem.layers, app.project.activeItem.layers.length);
            this.loadLayer(app.project.activeItem.layers, app.project.activeItem.layers.length);
        }
        Converter.prototype.loadProj = function () {
            this.proj = {
                name: this.app.project.activeItem.name,
                width: this.app.project.activeItem.width,
                height: this.app.project.activeItem.height,
                frameRate: this.app.project.activeItem.frameRate,
                frameCount: this.app.project.activeItem.frameRate * this.app.project.activeItem.duration,
            };
        };
        Converter.prototype.loadRes = function (layers, numLayers) {
            for (var i = 1; i <= layers.length; i++) {
                var element = layers[i];
                if (element.source && element.source.file) {
                    this.res.push({
                        name: element.source.name,
                        path: element.source.file.fsName,
                    });
                }
                else if (element.source.numLayers > 0) {
                    this.loadRes(element.source.layers, element.source.numLayers);
                }
            }
        };
        Converter.prototype.loadLayer = function (layers, numLayers) {
            for (var i = 1; i <= numLayers; i++) {
                var element = layers[i];
                if (element.source && element.source.file) {
                    this.layers.push({
                        name: element.source.name,
                        values: {
                            alpha: this.requestValue(element.transform.opacity),
                            matrix: this.requestMatrix(element.transform, element.width, element.height),
                        }
                    });
                }
                else if (element.source.numLayers > 0) {
                    this.loadLayer(element.source.layers, element.source.numLayers);
                }
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
                    ty: matrix.props[13],
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
    var Writer = (function () {
        function Writer(converter) {
            this.outPath = app.project.file.path + "/svga_works";
            this.converter = converter;
        }
        Writer.prototype.write = function () {
            this.createOutputDirectories();
            this.copyImages();
            this.writeSpec();
        };
        Writer.prototype.createOutputDirectories = function () {
            new Folder(this.outPath).create();
        };
        Writer.prototype.copyImages = function () {
            var _File = File;
            for (var index = 0; index < this.converter.res.length; index++) {
                var element = this.converter.res[index];
                (new _File(element.path)).copy(new _File(this.outPath + "/" + element.name));
            }
        };
        Writer.prototype.writeSpec = function () {
            var _File = File;
            var spec = {
                ver: "1.0.1",
                movie: {
                    viewBox: {
                        width: this.converter.proj.width,
                        height: this.converter.proj.height,
                    },
                    fps: this.converter.proj.frameRate,
                    frames: this.converter.proj.frameCount * this.converter.proj.frameRate,
                },
                images: {},
                sprites: {},
            };
            var movieFile = new _File(this.outPath + "/movie.spec");
            if (movieFile.exists) {
                movieFile.remove();
            }
            movieFile.encoding = "UTF-8";
            movieFile.open('e', "TEXT", "????");
            movieFile.write(JSON.stringify(spec));
            movieFile.close();
        };
        return Writer;
    }());
    SVGA.Writer = Writer;
})(SVGA || (SVGA = {}));
var converter = new SVGA.Converter(app);
var writer = new SVGA.Writer(converter);
writer.write();

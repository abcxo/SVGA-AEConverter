// var layers = app.project.activeItem.layers;
// for (var i = 1; i <= layers.length; i++) {
//     var element = layers[i];
//     if (element && element.transform && element.transform.opacity) {
//         $.write(element.transform.opacity.valueAtTime(0.0, true))
//     }
// }]
var SVGA;
(function (SVGA) {
    var Converter = (function () {
        function Converter(app) {
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
                        alpha: this.requestValue(element.transform.opacity)
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
        return Converter;
    }());
    SVGA.Converter = Converter;
})(SVGA || (SVGA = {}));
var converter = new SVGA.Converter(app);
$.write(converter.layers[0].values.alpha);

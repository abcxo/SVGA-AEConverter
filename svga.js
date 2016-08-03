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
                            alpha: this.requestAlpha(element.transform.opacity),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height),
                        }
                    });
                }
                else if (element.source.numLayers > 0) {
                    this.loadLayer(element.source.layers, element.source.numLayers);
                }
            }
        };
        Converter.prototype.requestAlpha = function (prop) {
            var value = [];
            var step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                value.push(prop.valueAtTime(cTime, true) / 100.0);
            }
            return value;
        };
        Converter.prototype.requestMatrix = function (transform, width, height) {
            var value = [];
            var step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                var rotation = transform["Rotation"].valueAtTime(cTime, true);
                var ax = transform["Anchor Point"].valueAtTime(cTime, true)[0];
                var ay = transform["Anchor Point"].valueAtTime(cTime, true)[1];
                var sx = transform["Scale"].valueAtTime(cTime, true)[0] / 100.0;
                var sy = transform["Scale"].valueAtTime(cTime, true)[1] / 100.0;
                var tx = transform["Position"].valueAtTime(cTime, true)[0];
                var ty = transform["Position"].valueAtTime(cTime, true)[1];
                var matrix = new Matrix();
                matrix.reset().rotate(rotation).scale(sx, sy);
                this.convertMatrix(matrix, ax, ay, sx, sy, tx, ty);
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
        Converter.prototype.requestLayout = function (width, height) {
            var value = [];
            var step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                value.push({ x: 0, y: 0, width: width, height: height });
            }
            return value;
        };
        Converter.prototype.convertMatrix = function (matrix, ax, ay, sx, sy, mtx, mty) {
            matrix.translate(mtx - (ax * sx), mty - (ay * sy));
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
                (new _File(element.path)).copy(new _File(this.outPath + "/" + element.name.replace(/\.png/ig, "").replace(/ /ig, "") + ".png"));
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
                    frames: this.converter.proj.frameCount,
                },
                images: {},
                sprites: [],
            };
            for (var index = 0; index < this.converter.res.length; index++) {
                var element = this.converter.res[index];
                spec.images[element.name.replace(/\.png/ig, "").replace(/ /ig, "")] = element.name.replace(/\.png/ig, "").replace(/ /ig, "");
            }
            for (var index = this.converter.layers.length - 1; index >= 0; index--) {
                var element = this.converter.layers[index];
                var frames_1 = [];
                for (var index_1 = 0; index_1 < this.converter.proj.frameCount; index_1++) {
                    var obj = {
                        alpha: element.values.alpha[index_1],
                        layout: element.values.layout[index_1],
                        transform: element.values.matrix[index_1],
                    };
                    if (obj.alpha <= 0.0) {
                        delete obj.alpha;
                    }
                    if (obj.layout.x == 0.0 && obj.layout.y == 0.0 && obj.layout.width == 0.0 && obj.layout.height == 0.0) {
                        delete obj.layout;
                    }
                    if (obj.transform.a == 1.0 && obj.transform.b == 0.0 && obj.transform.c == 0.0 && obj.transform.d == 1.0 && obj.transform.tx == 0.0 && obj.transform.ty == 0.0) {
                        delete obj.transform;
                    }
                    frames_1.push(obj);
                }
                spec.sprites.push({
                    imageKey: element.name.replace(/\.png/ig, "").replace(/ /ig, ""),
                    frames: frames_1,
                });
            }
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

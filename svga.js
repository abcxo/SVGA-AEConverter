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
            this.loadLayer(app.project.activeItem.layers, app.project.activeItem.layers.length, undefined, undefined);
            this.mergeLayers();
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
                if (element.enabled === false) {
                    continue;
                }
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
        Converter.prototype.loadLayer = function (layers, numLayers, parentValues, startTime) {
            for (var i = 1; i <= numLayers; i++) {
                var element = layers[i];
                if (element.enabled === false) {
                    continue;
                }
                if (element.source && element.source.file) {
                    if (parentValues) {
                        this.layers.push({
                            name: element.source.name,
                            values: this.concatValues(parentValues, {
                                alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                                layout: this.requestLayout(element.width, element.height),
                                matrix: this.requestMatrix(element.transform, element.width, element.height),
                                mask: this.requestMask(element),
                            }, element.width, element.height, startTime),
                        });
                    }
                    else {
                        this.layers.push({
                            name: element.source.name,
                            values: {
                                alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                                layout: this.requestLayout(element.width, element.height),
                                matrix: this.requestMatrix(element.transform, element.width, element.height),
                                mask: this.requestMask(element),
                            }
                        });
                    }
                }
                else if (element.source.numLayers > 0) {
                    this.loadLayer(element.source.layers, element.source.numLayers, {
                        alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                        layout: this.requestLayout(element.width, element.height),
                        matrix: this.requestMatrix(element.transform, element.width, element.height),
                        mask: [this.requestMask(element)],
                    }, element.startTime);
                }
            }
        };
        Converter.prototype.concatValues = function (a, b, width, height, startTime) {
            var c = JSON.parse(JSON.stringify(a));
            var startIndex = Math.round(startTime / (1.0 / this.proj.frameRate));
            if (startIndex < 0) {
                startIndex = 0;
            }
            for (var aIndex = startIndex, bIndex = 0; bIndex < b.alpha.length; aIndex++, bIndex++) {
                c.alpha[aIndex] = b.alpha[bIndex] * a.alpha[aIndex];
            }
            for (var aIndex = startIndex, bIndex = 0; bIndex < b.layout.length; aIndex++, bIndex++) {
                c.layout[aIndex] = b.layout[bIndex];
            }
            for (var aIndex = startIndex, bIndex = 0; bIndex < b.mask.length; aIndex++, bIndex++) {
                c.mask[aIndex] = b.mask[bIndex];
            }
            for (var aIndex = startIndex, bIndex = 0; bIndex < b.matrix.length && aIndex < a.matrix.length; aIndex++, bIndex++) {
                var matrix = new Matrix();
                matrix.reset();
                matrix.transform(b.matrix[bIndex].a, b.matrix[bIndex].b, 0, 0, b.matrix[bIndex].c, b.matrix[bIndex].d, 0, 0, 0, 0, 0, 0, b.matrix[bIndex].tx, b.matrix[bIndex].ty, 0, 0);
                matrix.transform(a.matrix[aIndex].a, a.matrix[aIndex].b, 0, 0, a.matrix[aIndex].c, a.matrix[aIndex].d, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                c.matrix[aIndex] = {
                    a: matrix.props[0],
                    b: matrix.props[1],
                    c: matrix.props[4],
                    d: matrix.props[5],
                    tx: matrix.props[12] + a.matrix[aIndex].tx,
                    ty: matrix.props[13] + a.matrix[aIndex].ty,
                };
            }
            for (var index = 0; index < startIndex; index++) {
                delete c.alpha[index];
                delete c.layout[index];
                delete c.matrix[index];
                delete c.mask[index];
            }
            return c;
        };
        Converter.prototype.requestAlpha = function (prop, inPoint, outPoint) {
            var value = [];
            var step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                if (inPoint > outPoint) {
                    if (cTime > inPoint || cTime < outPoint) {
                        value.push(0.0);
                        continue;
                    }
                }
                else if (inPoint < outPoint) {
                    if (cTime < inPoint || cTime > outPoint) {
                        value.push(0.0);
                        continue;
                    }
                }
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
                matrix.reset().translate(-ax, -ay).rotate(-rotation * Math.PI / 180).scale(sx, sy);
                matrix.translate(tx, ty);
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
        Converter.prototype.requestMask = function (layer) {
            if (layer.mask.numProperties > 0) {
                for (var index = 0; index < layer.mask.numProperties; index++) {
                    var masks = [];
                    var maskElement = layer.mask(index + 1);
                    var maskShape = maskElement.property('maskShape').value;
                    var closed_1 = maskShape.closed;
                    var inverted = maskElement.inverted;
                    var mode = maskElement.maskMode;
                    var values = [];
                    var step = 1.0 / this.proj.frameRate;
                    for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                        var vertices = maskElement.property('maskShape').valueAtTime(cTime, true).vertices;
                        var solidPath = '';
                        var drawPath = '';
                        var finalPath = '';
                        if (inverted) {
                            solidPath = 'M0,0 ';
                            solidPath += ' h' + layer.width;
                            solidPath += ' v' + layer.height;
                            solidPath += ' h-' + layer.width;
                            solidPath += ' v-' + layer.height + ' ';
                        }
                        var lastPoint = undefined;
                        for (var index = 0; index < vertices.length; index++) {
                            var currentPoint = vertices[index];
                            if (lastPoint === undefined) {
                                drawPath += " M" + Math.round(currentPoint[0]) + "," + Math.round(currentPoint[1]);
                                lastPoint = currentPoint;
                            }
                            else {
                                drawPath += " C" + Math.round(lastPoint[0]) + "," + Math.round(lastPoint[1]) + " " + Math.round(currentPoint[0]) + "," + Math.round(currentPoint[1]) + " " + Math.round(currentPoint[0]) + "," + Math.round(currentPoint[1]);
                                lastPoint = currentPoint;
                            }
                        }
                        if (closed_1) {
                            drawPath += " C" + Math.round(lastPoint[0]) + "," + Math.round(lastPoint[1]) + " " + Math.round(vertices[0][0]) + "," + Math.round(vertices[0][1]) + " " + Math.round(vertices[0][0]) + "," + Math.round(vertices[0][1]);
                        }
                        if (inverted) {
                            finalPath = solidPath + drawPath;
                        }
                        else {
                            finalPath = drawPath;
                        }
                        masks.push(finalPath);
                    }
                    return masks;
                }
            }
            return [];
        };
        Converter.prototype.mergeLayers = function () {
            var rangeLength = 1;
            for (var index = 0; index < this.layers.length; index += rangeLength) {
                var layer = this.layers[index];
                rangeLength = 1;
                for (var nIndex = index + 1; nIndex < this.layers.length; nIndex++) {
                    if (this.layers[nIndex].name === layer.name) {
                        rangeLength++;
                    }
                    else {
                        break;
                    }
                }
                if (rangeLength > 1) {
                    var maxInterSets = 1;
                    for (var frameNum = 0; frameNum < this.proj.frameCount; frameNum++) {
                        var thisMax = 0;
                        for (var checkIndex = index; checkIndex < index + rangeLength; checkIndex++) {
                            if (this.layers[checkIndex].values.alpha[frameNum] > 0.0) {
                                thisMax++;
                            }
                        }
                        maxInterSets = Math.max(maxInterSets, thisMax);
                    }
                    if (maxInterSets === 1 || maxInterSets === rangeLength) {
                        continue;
                    }
                    var mergedLayers = [];
                    for (var _ = 0; _ < maxInterSets; _++) {
                        mergedLayers.push({
                            name: layer.name,
                            values: {
                                alpha: [],
                                layout: [],
                                matrix: [],
                                mask: [],
                            }
                        });
                    }
                    for (var frameNum = 0; frameNum < this.proj.frameCount; frameNum++) {
                        var currentLayer = 0;
                        for (var checkIndex = index; checkIndex < index + rangeLength; checkIndex++) {
                            if (this.layers[checkIndex].values.alpha[frameNum] > 0.0) {
                                mergedLayers[currentLayer].values.alpha.push(this.layers[checkIndex].values.alpha[frameNum]);
                                mergedLayers[currentLayer].values.layout.push(this.layers[checkIndex].values.layout[frameNum]);
                                mergedLayers[currentLayer].values.matrix.push(this.layers[checkIndex].values.matrix[frameNum]);
                                mergedLayers[currentLayer].values.mask.push(this.layers[checkIndex].values.mask[frameNum]);
                                currentLayer++;
                            }
                        }
                        for (var leftIndex = currentLayer; leftIndex < maxInterSets; leftIndex++) {
                            mergedLayers[leftIndex].values.alpha.push(0.0);
                            mergedLayers[leftIndex].values.layout.push(undefined);
                            mergedLayers[leftIndex].values.matrix.push(undefined);
                            mergedLayers[leftIndex].values.mask.push(undefined);
                        }
                    }
                    var replaceLayers = [];
                    var startInsertion = false;
                    for (var fIndex = 0; fIndex < this.layers.length; fIndex++) {
                        var element = this.layers[fIndex];
                        if (!startInsertion) {
                            if (fIndex < index) {
                                replaceLayers.push(element);
                            }
                            else {
                                startInsertion = true;
                                for (var mIndex = 0; mIndex < mergedLayers.length; mIndex++) {
                                    replaceLayers.push(mergedLayers[mIndex]);
                                }
                            }
                        }
                        else {
                            if (fIndex >= index + rangeLength) {
                                replaceLayers.push(element);
                            }
                            else {
                                continue;
                            }
                        }
                    }
                    this.layers = replaceLayers;
                    this.mergeLayers();
                    return;
                }
            }
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
                        clipPath: element.values.mask[index_1],
                    };
                    if (obj.alpha === undefined || obj.alpha <= 0.0) {
                        delete obj.alpha;
                        delete obj.layout;
                        delete obj.transform;
                        delete obj.clipPath;
                    }
                    if (obj.layout === undefined || (obj.layout.x == 0.0 && obj.layout.y == 0.0 && obj.layout.width == 0.0 && obj.layout.height == 0.0)) {
                        delete obj.layout;
                    }
                    if (obj.transform === undefined || (obj.transform.a == 1.0 && obj.transform.b == 0.0 && obj.transform.c == 0.0 && obj.transform.d == 1.0 && obj.transform.tx == 0.0 && obj.transform.ty == 0.0)) {
                        delete obj.transform;
                    }
                    if (obj.clipPath === undefined || typeof obj.clipPath !== "string" || obj.clipPath === "") {
                        delete obj.clipPath;
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

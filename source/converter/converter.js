/// <reference path="../app/svga.ts" />
/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 * Build: npm install & npm start
 */
var Converter = (function () {
    function Converter(app) {
        this.app = undefined;
        this.proj = undefined;
        this.res = [];
        this.layers = [];
        this.app = app;
        this.loadProj();
        this.loadRes(app.project.activeItem.layers, app.project.activeItem.layers.length);
        this.loadLayer(app.project.activeItem.layers, app.project.activeItem.layers.length, undefined, undefined, []);
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
        var m = {};
        for (var i = 1; i <= layers.length; i++) {
            var element = layers[i];
            if (element.enabled === false || element.source === null || element.source === undefined) {
                continue;
            }
            if (element.source instanceof Object && element.source.file) {
                if (m[element.source.id] === true) {
                    continue;
                }
                m[element.source.id] = true;
                if (element.source.file.fsName.indexOf(".psd") > 0) {
                    this.res.push({
                        name: "psd_" + element.source.id + ".png",
                        path: element.source.file.fsName,
                        source: element.source,
                        psdID: element.source.id.toString(),
                    });
                }
                else {
                    var eName = element.source.name;
                    if (element.source.name.match(/[^a-zA-Z0-9\.\_\-]/)) {
                        eName = "img_" + element.source.id + ".png";
                    }
                    else {
                        eName = element.source.name;
                    }
                    this.res.push({
                        name: eName,
                        path: element.source.file.fsName,
                        source: element.source,
                        psdID: undefined,
                    });
                }
            }
            else if (element.source instanceof Object && element.source.numLayers > 0) {
                this.loadRes(element.source.layers, element.source.numLayers);
            }
        }
    };
    Converter.prototype.loadLayer = function (layers, numLayers, parentValues, startTime, parents) {
        for (var i = 1; i <= numLayers; i++) {
            var element = layers[i];
            if (element.enabled === false) {
                continue;
            }
            if (element.matchName === "ADBE Vector Layer") {
                if (parentValues) {
                    this.layers.push({
                        name: element.name + ".vector",
                        values: this.concatValues(parentValues, {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                            mask: this.requestMask(element),
                            shapes: this.requestShapes(element),
                        }, element.width, element.height, startTime),
                    });
                }
                else {
                    this.layers.push({
                        name: element.name + ".vector",
                        values: {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                            mask: this.requestMask(element),
                            shapes: this.requestShapes(element),
                        }
                    });
                }
            }
            else if (element.source instanceof Object && element.source.file) {
                var eName = element.source.name;
                if (eName.indexOf('.psd') > 0) {
                    eName = "psd_" + element.source.id + ".png";
                }
                else {
                    if (element.source.name.match(/[^a-zA-Z0-9\.\_\-]/)) {
                        eName = "img_" + element.source.id + ".png";
                    }
                    else {
                        eName = element.source.name;
                    }
                }
                if (parentValues) {
                    this.layers.push({
                        name: eName,
                        values: this.concatValues(parentValues, {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                            mask: this.requestMask(element),
                            shapes: [],
                        }, element.width, element.height, startTime),
                    });
                }
                else {
                    this.layers.push({
                        name: eName,
                        values: {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                            mask: this.requestMask(element),
                            shapes: [],
                        }
                    });
                }
            }
            else if (element.source instanceof Object && element.source.numLayers > 0) {
                var nextParents = [];
                if (parents !== undefined) {
                    for (var index = 0; index < parents.length; index++) {
                        nextParents.push(parents[index]);
                    }
                }
                nextParents.push(element);
                if (parentValues) {
                    this.loadLayer(element.source.layers, element.source.numLayers, this.concatValues(parentValues, {
                        alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                        layout: this.requestLayout(element.width, element.height),
                        matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                        mask: [this.requestMask(element)],
                    }, element.width, element.height, startTime), element.startTime, nextParents);
                }
                else {
                    this.loadLayer(element.source.layers, element.source.numLayers, {
                        alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                        layout: this.requestLayout(element.width, element.height),
                        matrix: this.requestMatrix(element.transform, element.width, element.height, element),
                        mask: [this.requestMask(element)],
                    }, element.startTime, nextParents);
                }
            }
        }
    };
    Converter.prototype.concatValues = function (a, b, width, height, startTime) {
        var c = JSON.parse(JSON.stringify(a));
        var startIndex = startTime / (1.0 / Math.round(this.proj.frameRate));
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.alpha.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            c.alpha[aIndex] = b.alpha[bIndex] * a.alpha[aIndex];
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.layout.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            c.layout[aIndex] = b.layout[bIndex];
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.mask.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            c.mask[aIndex] = b.mask[bIndex];
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.matrix.length && aIndex < a.matrix.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            var matrix = new Matrix();
            matrix.reset();
            if (b.matrix[bIndex] !== undefined && b.matrix[bIndex] !== null) {
                matrix.transform(b.matrix[bIndex].a, b.matrix[bIndex].b, 0, 0, b.matrix[bIndex].c, b.matrix[bIndex].d, 0, 0, 0, 0, 0, 0, b.matrix[bIndex].tx, b.matrix[bIndex].ty, 0, 0);
                c.matrix[aIndex] = {
                    a: matrix.props[0],
                    b: matrix.props[1],
                    c: matrix.props[4],
                    d: matrix.props[5],
                    tx: matrix.props[12],
                    ty: matrix.props[13],
                };
            }
            if (a.matrix[aIndex] !== undefined && a.matrix[aIndex] !== null) {
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
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.mask.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            c.shapes[aIndex] = b.shapes[bIndex];
        }
        for (var index = 0; index < startIndex; index++) {
            delete c.alpha[index];
            delete c.layout[index];
            delete c.matrix[index];
            delete c.mask[index];
            delete c.shapes[index];
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
    Converter.prototype.requestMatrix = function (transform, width, height, object) {
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
            matrix.translate(-ax, -ay).scale(sx, sy).rotate(-rotation * Math.PI / 180);
            matrix.translate(tx, ty);
            var currentParent = object.parent;
            while (currentParent != null && currentParent != undefined) {
                matrix.translate(-currentParent.transform["Anchor Point"].valueAtTime(cTime, true)[0], -currentParent.transform["Anchor Point"].valueAtTime(cTime, true)[1])
                    .scale(currentParent.transform["Scale"].valueAtTime(cTime, true)[0] / 100.0, currentParent.transform["Scale"].valueAtTime(cTime, true)[1] / 100.0)
                    .rotate(-(currentParent.transform["Rotation"].valueAtTime(cTime, true)) * Math.PI / 180);
                matrix.translate(currentParent.transform["Position"].valueAtTime(cTime, true)[0], currentParent.transform["Position"].valueAtTime(cTime, true)[1]);
                currentParent = currentParent.parent;
            }
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
                            drawPath += " M" + currentPoint[0].toFixed(3) + "," + currentPoint[1].toFixed(3);
                            lastPoint = currentPoint;
                        }
                        else {
                            drawPath += " C" + lastPoint[0].toFixed(3) + "," + lastPoint[1].toFixed(3) + " " + currentPoint[0].toFixed(3) + "," + currentPoint[1].toFixed(3) + " " + currentPoint[0].toFixed(3) + "," + currentPoint[1].toFixed(3);
                            lastPoint = currentPoint;
                        }
                    }
                    if (closed_1) {
                        drawPath += " C" + lastPoint[0].toFixed(3) + "," + lastPoint[1].toFixed(3) + " " + vertices[0][0].toFixed(3) + "," + vertices[0][1].toFixed(3) + " " + vertices[0][0].toFixed(3) + "," + vertices[0][1].toFixed(3);
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
    Converter.prototype.requestShapes = function (layer) {
        var values = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
            var value = this.requestShapesAtTime(layer, cTime);
            values.push(value);
        }
        return values;
    };
    Converter.prototype.requestShapesAtTime = function (layer, cTime, parent) {
        var shapes = [];
        if (!layer.enabled) {
            return shapes;
        }
        if (layer.matchName == "ADBE Vector Shape - Group") {
            var pathContents = layer.property('Path');
            var path = pathContents.valueAtTime(cTime, true);
            var inTangents = path.inTangents;
            var outTangents = path.outTangents;
            var vertices = path.vertices;
            if (layer.property("Shape Direction").valueAtTime(cTime, true) === 3) {
                inTangents.reverse();
                outTangents.reverse();
                vertices.reverse();
            }
            var d = "";
            for (var index = 0; index <= vertices.length; index++) {
                var vertex = vertices[index];
                var it = inTangents[index];
                var ot = outTangents[index];
                if (index == 0) {
                    d += "M " + vertex[0].toFixed(3) + " " + vertex[1].toFixed(3) + " ";
                }
                else if (index == vertices.length) {
                    if (!path.closed) {
                        continue;
                    }
                    d += "C " + (vertices[index - 1][0] + outTangents[index - 1][0]).toFixed(3) +
                        " " + (vertices[index - 1][1] + outTangents[index - 1][1]).toFixed(3) +
                        " " + (vertices[0][0] + inTangents[0][0]).toFixed(3) +
                        " " + (vertices[0][1] + inTangents[0][1]).toFixed(3) +
                        " " + (vertices[0][0]).toFixed(3) +
                        " " + (vertices[0][1]).toFixed(3) +
                        " ";
                }
                else {
                    d += "C " + (vertices[index - 1][0] + outTangents[index - 1][0]).toFixed(3) +
                        " " + (vertices[index - 1][1] + outTangents[index - 1][1]).toFixed(3) +
                        " " + (vertex[0] + inTangents[index][0]).toFixed(3) +
                        " " + (vertex[1] + inTangents[index][1]).toFixed(3) +
                        " " + (vertex[0]).toFixed(3) +
                        " " + (vertex[1]).toFixed(3) +
                        " ";
                }
            }
            if (path.closed) {
                d += "Z";
            }
            var shape = {
                type: "shape",
                args: {
                    d: d,
                },
                styles: this.requestShapeStyles(layer, parent, cTime),
                transform: this.requestShapeTransform(parent, cTime),
            };
            shapes.unshift(shape);
        }
        else if (layer.matchName == "ADBE Vector Shape - Ellipse") {
            var sizeContents = layer.property('Size');
            var size = sizeContents.valueAtTime(cTime, true);
            var positionContents = layer.property('Position');
            var position = positionContents.valueAtTime(cTime, true);
            var shape = {
                type: "ellipse",
                args: {
                    x: position[0],
                    y: position[1],
                    radiusX: size[0] / 2.0,
                    radiusY: size[1] / 2.0,
                },
                styles: this.requestShapeStyles(layer, parent, cTime),
                transform: this.requestShapeTransform(parent, cTime),
            };
            shapes.unshift(shape);
        }
        else if (layer.matchName == "ADBE Vector Shape - Rect") {
            var sizeContents = layer.property('Size');
            var size = sizeContents.valueAtTime(cTime, true);
            var positionContents = layer.property('Position');
            var position = positionContents.valueAtTime(cTime, true);
            var shape = {
                type: "rect",
                args: {
                    x: position[0] - size[0] / 2.0,
                    y: position[1] - size[1] / 2.0,
                    width: size[0],
                    height: size[1],
                    cornerRadius: layer.property('Roundness').valueAtTime(cTime, true),
                },
                styles: this.requestShapeStyles(layer, parent, cTime),
                transform: this.requestShapeTransform(parent, cTime),
            };
            shapes.unshift(shape);
        }
        else {
            var contents = layer.property('Contents');
            if (contents != null && contents != undefined) {
                var numProperties = contents.numProperties;
                for (var index_1 = 0; index_1 < numProperties; index_1 += 1) {
                    var sublayer = contents.property(index_1 + 1);
                    var results = this.requestShapesAtTime(sublayer, cTime, layer);
                    for (var i = 0; i < results.length; i++) {
                        var element = results[i];
                        shapes.unshift(element);
                    }
                }
            }
        }
        return shapes;
    };
    Converter.prototype.requestShapeStyles = function (layer, parent, cTime) {
        var styles = {};
        var contents = parent.property('Contents');
        var numProperties = contents.numProperties;
        for (var index = 0; index < numProperties; index += 1) {
            var sublayer = contents.property(index + 1);
            if (!sublayer.enabled) {
                continue;
            }
            if (sublayer.matchName == "ADBE Vector Graphic - Fill") {
                styles.fill = sublayer.property('Color').valueAtTime(cTime, true);
            }
            else if (sublayer.matchName == "ADBE Vector Filter - Trim" || sublayer.matchName == "ADBE Vector Graphic - Trim") {
                styles.trim = {
                    start: sublayer.property('Start').valueAtTime(cTime, true) / 100.0,
                    end: sublayer.property('End').valueAtTime(cTime, true) / 100.0,
                };
            }
            else if (sublayer.matchName == "ADBE Vector Graphic - Stroke") {
                styles.stroke = sublayer.property('Color').valueAtTime(cTime, true);
                styles.strokeWidth = sublayer.property('Stroke Width').valueAtTime(cTime, true);
                var lineCap = sublayer.property('Line Cap').valueAtTime(cTime, true);
                switch (lineCap) {
                    case 1:
                        styles.lineCap = "butt";
                        break;
                    case 2:
                        styles.lineCap = "round";
                        break;
                    case 3:
                        styles.lineCap = "square";
                        break;
                }
                var lineJoin = sublayer.property('Line Join').valueAtTime(cTime, true);
                switch (lineJoin) {
                    case 1:
                        styles.lineJoin = "miter";
                        styles.miterLimit = sublayer.property('Miter Limit').valueAtTime(cTime, true);
                        break;
                    case 2:
                        styles.lineJoin = "round";
                        break;
                    case 3:
                        styles.lineJoin = "bevel";
                        break;
                }
                var dashObject = sublayer.property('Dashes');
                if (dashObject != null && dashObject != undefined) {
                    var j = void 0, jLen = dashObject.numProperties;
                    if (jLen > 0) {
                        var dashesData = [];
                        var dash = 0;
                        var gap = 0;
                        var offset = 0;
                        for (j = 0; j < jLen; j += 1) {
                            if (dashObject.property(j + 1).canSetExpression) {
                                var dashData = {};
                                var name = '';
                                if (dashObject.property(j + 1).matchName.indexOf('ADBE Vector Stroke Dash') !== -1) {
                                    dash = dashObject.property(j + 1).valueAtTime(cTime, true);
                                }
                                else if (dashObject.property(j + 1).matchName.indexOf('ADBE Vector Stroke Gap') !== -1) {
                                    gap = dashObject.property(j + 1).valueAtTime(cTime, true);
                                }
                                else if (dashObject.property(j + 1).matchName === 'ADBE Vector Stroke Offset') {
                                    offset = dashObject.property(j + 1).valueAtTime(cTime, true);
                                }
                            }
                        }
                        if (dash != 0 || gap != 0 || offset != 0) {
                            styles.lineDash = [dash, gap, offset];
                        }
                    }
                }
            }
        }
        return styles;
    };
    Converter.prototype.requestShapeTransform = function (parent, cTime) {
        var transform = parent.property('Transform');
        var rotation = transform["Rotation"].valueAtTime(cTime, true);
        var ax = transform["Anchor Point"].valueAtTime(cTime, true)[0];
        var ay = transform["Anchor Point"].valueAtTime(cTime, true)[1];
        var sx = transform["Scale"].valueAtTime(cTime, true)[0] / 100.0;
        var sy = transform["Scale"].valueAtTime(cTime, true)[1] / 100.0;
        var tx = transform["Position"].valueAtTime(cTime, true)[0];
        var ty = transform["Position"].valueAtTime(cTime, true)[1];
        var matrix = new Matrix();
        matrix.translate(-ax, -ay).scale(sx, sy).rotate(-rotation * Math.PI / 180);
        matrix.translate(tx, ty);
        return {
            a: matrix.props[0],
            b: matrix.props[1],
            c: matrix.props[4],
            d: matrix.props[5],
            tx: matrix.props[12],
            ty: matrix.props[13],
        };
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
                            shapes: [],
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
                            mergedLayers[currentLayer].values.shapes.push(this.layers[checkIndex].values.shapes[frameNum]);
                            currentLayer++;
                        }
                    }
                    for (var leftIndex = currentLayer; leftIndex < maxInterSets; leftIndex++) {
                        mergedLayers[leftIndex].values.alpha.push(0.0);
                        mergedLayers[leftIndex].values.layout.push(undefined);
                        mergedLayers[leftIndex].values.matrix.push(undefined);
                        mergedLayers[leftIndex].values.mask.push(undefined);
                        mergedLayers[leftIndex].values.shapes.push(undefined);
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

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
        this.trimmingCache = {};
        this.app = app;
        this.loadProj();
        this.loadRes(app.project.activeItem.layers, app.project.activeItem.layers.length);
        this.loadLayer({ frameRate: app.project.activeItem.frameRate, duration: app.project.activeItem.duration }, app.project.activeItem.layers, app.project.activeItem.layers.length, undefined, undefined, []);
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
                if (element.source.file.fsName.indexOf(".psd") > 0 || element.source.file.fsName.indexOf(".psb") > 0) {
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
    Converter.prototype.loadLayer = function (frameConfig, layers, numLayers, parentValues, startTime, parents) {
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
                            alpha: this.requestAlpha(frameConfig, element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(frameConfig, element.width, element.height),
                            matrix: this.requestMatrix(frameConfig, element.transform, element.width, element.height, element),
                            mask: this.requestMask(frameConfig, element, parents),
                            shapes: this.requestShapes(frameConfig, element),
                        }, element.width, element.height, startTime),
                    });
                }
                else {
                    this.layers.push({
                        name: element.name + ".vector",
                        values: {
                            alpha: this.requestAlpha(frameConfig, element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(frameConfig, element.width, element.height),
                            matrix: this.requestMatrix(frameConfig, element.transform, element.width, element.height, element),
                            mask: this.requestMask(frameConfig, element, parents),
                            shapes: this.requestShapes(frameConfig, element),
                        }
                    });
                }
            }
            else if (element.source instanceof Object && element.source.file) {
                var eName = element.source.name;
                if (eName.indexOf('.psd') > 0 || eName.indexOf('.psb') > 0) {
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
                            alpha: this.requestAlpha(frameConfig, element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(frameConfig, element.width, element.height),
                            matrix: this.requestMatrix(frameConfig, element.transform, element.width, element.height, element),
                            mask: this.requestMask(frameConfig, element, parents),
                            shapes: [],
                        }, element.width, element.height, startTime),
                    });
                }
                else {
                    this.layers.push({
                        name: eName,
                        values: {
                            alpha: this.requestAlpha(frameConfig, element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(frameConfig, element.width, element.height),
                            matrix: this.requestMatrix(frameConfig, element.transform, element.width, element.height, element),
                            mask: this.requestMask(frameConfig, element, parents),
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
                    this.loadLayer({ frameRate: element.source.frameRate, duration: element.source.duration }, element.source.layers, element.source.numLayers, this.concatValues(parentValues, {
                        alpha: this.requestAlpha(frameConfig, element.transform.opacity, element.inPoint, element.outPoint),
                        layout: this.requestLayout(frameConfig, element.width, element.height),
                        matrix: this.requestMatrix(frameConfig, element.transform, element.width, element.height, element),
                        mask: [],
                        shapes: [],
                    }, element.width, element.height, startTime), element.startTime, nextParents);
                }
                else {
                    this.loadLayer({ frameRate: element.source.frameRate, duration: element.source.duration }, element.source.layers, element.source.numLayers, {
                        alpha: this.requestAlpha(frameConfig, element.transform.opacity, element.inPoint, element.outPoint),
                        layout: this.requestLayout(frameConfig, element.width, element.height),
                        matrix: this.requestMatrix(frameConfig, element.transform, element.width, element.height, element),
                        mask: [],
                        shapes: [],
                    }, element.startTime, nextParents);
                }
            }
        }
    };
    Converter.prototype.concatValues = function (a, b, width, height, startTime) {
        var c = JSON.parse(JSON.stringify(a));
        var startIndex = Math.floor(startTime / (1.0 / Math.round(this.proj.frameRate)));
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.alpha.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            c.alpha[aIndex] = b.alpha[bIndex] * a.alpha[aIndex];
        }
        for (var aIndex = startIndex + b.alpha.length; aIndex < a.alpha.length; aIndex++) {
            if (aIndex < 0) {
                continue;
            }
            delete c.alpha[aIndex];
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.layout.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            c.layout[aIndex] = b.layout[bIndex];
        }
        for (var aIndex = startIndex + b.layout.length; aIndex < a.layout.length; aIndex++) {
            if (aIndex < 0) {
                continue;
            }
            delete c.layout[aIndex];
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.mask.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            c.mask[aIndex] = b.mask[bIndex];
        }
        for (var aIndex = startIndex + b.mask.length; aIndex < a.mask.length; aIndex++) {
            if (aIndex < 0) {
                continue;
            }
            delete c.mask[aIndex];
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
        for (var aIndex = startIndex + b.matrix.length; aIndex < a.matrix.length; aIndex++) {
            if (aIndex < 0) {
                continue;
            }
            delete c.matrix[aIndex];
        }
        for (var aIndex = startIndex, bIndex = 0; bIndex < b.shapes.length; aIndex++, bIndex++) {
            if (aIndex < 0) {
                continue;
            }
            if (c.shapes != undefined && b.shapes != undefined) {
                c.shapes[aIndex] = b.shapes[bIndex];
            }
        }
        for (var aIndex = startIndex + b.shapes.length; aIndex < a.shapes.length; aIndex++) {
            if (aIndex < 0) {
                continue;
            }
            delete c.shapes[aIndex];
        }
        for (var index = 0; index < startIndex; index++) {
            delete c.alpha[index];
            delete c.layout[index];
            delete c.matrix[index];
            delete c.mask[index];
            if (c.shapes != undefined) {
                delete c.shapes[index];
            }
        }
        return c;
    };
    Converter.prototype.requestAlpha = function (frameConfig, prop, inPoint, outPoint) {
        var value = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < frameConfig.duration; cTime += step) {
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
            value.push(prop.valueAtTime(cTime, false) / 100.0);
        }
        return value;
    };
    Converter.prototype.requestMatrix = function (frameConfig, transform, width, height, object) {
        var value = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < frameConfig.duration; cTime += step) {
            var rotation = transform["Rotation"].valueAtTime(cTime, false);
            var ax = transform["Anchor Point"].valueAtTime(cTime, false)[0];
            var ay = transform["Anchor Point"].valueAtTime(cTime, false)[1];
            var sx = transform["Scale"].valueAtTime(cTime, false)[0] / 100.0;
            var sy = transform["Scale"].valueAtTime(cTime, false)[1] / 100.0;
            var tx = transform["Position"].valueAtTime(cTime, false)[0];
            var ty = transform["Position"].valueAtTime(cTime, false)[1];
            var matrix = new Matrix();
            matrix.translate(-ax, -ay).scale(sx, sy).rotate(-rotation * Math.PI / 180);
            matrix.translate(tx, ty);
            var currentParent = object.parent;
            while (currentParent != null && currentParent != undefined) {
                matrix.translate(-currentParent.transform["Anchor Point"].valueAtTime(cTime, false)[0], -currentParent.transform["Anchor Point"].valueAtTime(cTime, false)[1])
                    .scale(currentParent.transform["Scale"].valueAtTime(cTime, false)[0] / 100.0, currentParent.transform["Scale"].valueAtTime(cTime, false)[1] / 100.0)
                    .rotate(-(currentParent.transform["Rotation"].valueAtTime(cTime, false)) * Math.PI / 180);
                matrix.translate(currentParent.transform["Position"].valueAtTime(cTime, false)[0], currentParent.transform["Position"].valueAtTime(cTime, false)[1]);
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
    Converter.prototype.requestLayout = function (frameConfig, width, height) {
        var value = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < frameConfig.duration; cTime += step) {
            value.push({ x: 0, y: 0, width: width, height: height });
        }
        return value;
    };
    Converter.prototype.requestMask = function (frameConfig, layer, parents) {
        var hasMask = false;
        var masks = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < frameConfig.duration; cTime += step) {
            var d = "";
            if (layer.mask.numProperties > 0) {
                var maskElement = layer.mask(1);
                d += this.requestPath(maskElement.property('maskShape').valueAtTime(cTime, false), { x: 0.0, y: 0.0 });
                hasMask = true;
            }
            var offsetX = layer.transform["Position"].valueAtTime(cTime, false)[0] - layer.transform["Anchor Point"].valueAtTime(cTime, false)[0];
            var offsetY = layer.transform["Position"].valueAtTime(cTime, false)[1] - layer.transform["Anchor Point"].valueAtTime(cTime, false)[1];
            for (var index = parents.length - 1; index >= 0; index--) {
                var element = parents[index];
                if (element.mask.numProperties > 0) {
                    var maskElement = element.mask(1);
                    d += this.requestPath(maskElement.property('maskShape').valueAtTime(cTime, false), { x: -offsetX, y: -offsetY });
                    offsetX += element.transform["Position"].valueAtTime(cTime, false)[0] - element.transform["Anchor Point"].valueAtTime(cTime, false)[0];
                    offsetY += element.transform["Position"].valueAtTime(cTime, false)[1] - element.transform["Anchor Point"].valueAtTime(cTime, false)[1];
                    hasMask = true;
                }
            }
            masks.push(d);
        }
        if (!hasMask) {
            return [];
        }
        return masks;
    };
    Converter.prototype.trimmedPath = function (path, reverse, trim) {
        if (reverse === void 0) { reverse = false; }
        var inTangents = path.inTangents;
        var outTangents = path.outTangents;
        var vertices = path.vertices;
        if (reverse) {
            inTangents = inTangents.reverse();
            outTangents = outTangents.reverse();
            vertices = vertices.reverse();
        }
        var cacheKey = inTangents.map(function (item) { return item[0] + "," + item[1]; }).join(",") + "_" +
            outTangents.map(function (item) { return item[0] + "," + item[1]; }).join(",") + "_" +
            vertices.map(function (item) { return item[0] + "," + item[1]; }).join(",") + "_" +
            (reverse ? "true" : "false") + "_" +
            trim.start + "," + trim.end;
        if (this.trimmingCache[cacheKey] != undefined) {
            return this.trimmingCache[cacheKey];
        }
        var length = 0.0;
        for (var index = 0; index <= vertices.length; index++) {
            var vertex = vertices[index];
            var it = inTangents[index];
            var ot = outTangents[index];
            if (index == 0) { }
            else if (index == vertices.length) {
                if (!path.closed) {
                    continue;
                }
                var curve = new Bezier(vertices[index - 1][0] + outTangents[index - 1][0], vertices[index - 1][1] + outTangents[index - 1][1], vertices[0][0] + inTangents[0][0], vertices[0][1] + inTangents[0][1], vertices[0][0], vertices[0][1]);
                length += curve.length();
            }
            else {
                var curve = new Bezier((vertices[index - 1][0] + outTangents[index - 1][0]), (vertices[index - 1][1] + outTangents[index - 1][1]), (vertex[0] + inTangents[index][0]), (vertex[1] + inTangents[index][1]), (vertex[0]), (vertex[1]));
                length += curve.length();
            }
        }
        var curvePoints = [];
        var currentProgress = 0.0;
        for (var index = 0; index <= vertices.length; index++) {
            var vertex = vertices[index];
            var it = inTangents[index];
            var ot = outTangents[index];
            if (index == 0) { }
            else if (index == vertices.length) {
                if (!path.closed) {
                    continue;
                }
                var curve = new Bezier(vertices[index - 1][0] + outTangents[index - 1][0], vertices[index - 1][1] + outTangents[index - 1][1], vertices[0][0] + inTangents[0][0], vertices[0][1] + inTangents[0][1], vertices[0][0], vertices[0][1]);
                var segmentProgress = curve.length() / length;
                if (currentProgress >= trim.start && currentProgress + segmentProgress <= trim.end) {
                    curvePoints.push([vertex[0], vertex[1], vertices[index - 1][0] + outTangents[index - 1][0], vertices[index - 1][1] + outTangents[index - 1][1], vertex[0] + inTangents[index][0], vertex[1] + inTangents[index][1]]);
                }
                else {
                    var trimmedLength = (trim.end > (currentProgress + segmentProgress) ? (currentProgress + segmentProgress) : trim.end) * length - (trim.start > currentProgress ? trim.start : currentProgress) * length;
                    var trimmedLeftLength = Math.max(0.0, (trim.start - currentProgress) * length);
                    var trimmedRightLength = Math.max(0.0, ((currentProgress + segmentProgress) - trim.end) * length);
                    var t = {
                        s: trimmedLeftLength / curve.length(),
                        e: 1.0 - trimmedRightLength / curve.length()
                    };
                    var nc = curve.split(t.s, t.e);
                    curvePoints.push([nc.points[0].x, nc.points[0].y, nc.points[1].x, nc.points[1].y, nc.points[2].x, nc.points[2].y]);
                }
                currentProgress += segmentProgress;
            }
            else {
                var curve = new Bezier((vertices[index - 1][0] + outTangents[index - 1][0]), (vertices[index - 1][1] + outTangents[index - 1][1]), (vertex[0] + inTangents[index][0]), (vertex[1] + inTangents[index][1]), (vertex[0]), (vertex[1]));
                var curveLength = curve.length();
                var segmentProgress = curveLength / length;
                if (currentProgress >= trim.start && currentProgress + segmentProgress <= trim.end) {
                    curvePoints.push([vertices[index - 1][0] + outTangents[index - 1][0], vertices[index - 1][1] + outTangents[index - 1][1], vertex[0] + inTangents[index][0], vertex[1] + inTangents[index][1], vertex[0], vertex[1]]);
                }
                else {
                    var trimmedLeftLength = Math.max(0.0, (trim.start - currentProgress) * length);
                    var trimmedRightLength = Math.max(0.0, ((currentProgress + segmentProgress) - trim.end) * length);
                    var t = {
                        s: trimmedLeftLength / curveLength,
                        e: 1.0 - trimmedRightLength / curveLength
                    };
                    var nc = curve.split(t.s, t.e);
                    curvePoints.push([nc.points[0].x, nc.points[0].y, nc.points[1].x, nc.points[1].y, nc.points[2].x, nc.points[2].y]);
                }
                currentProgress += segmentProgress;
            }
        }
        var d = "";
        for (var index = 0; index < curvePoints.length; index++) {
            var element = curvePoints[index];
            if (index == 0) {
                d += "M " + (element[0]) + " " + (element[1]);
            }
            d += " C " + (element[0]) + " " + (element[1]) + " " + (element[2]) + " " + (element[3]) + " " + (element[4]) + " " + (element[5]);
        }
        d = d.replace(/([0-9]+\.[0-9][0-9][0-9])[0-9]+/ig, "$1");
        this.trimmingCache[cacheKey] = d;
        return d;
    };
    Converter.prototype.requestPath = function (path, offset, reverse, trim) {
        if (reverse === void 0) { reverse = false; }
        if (trim === void 0) { trim = { start: 0.0, end: 1.0 }; }
        var inTangents = path.inTangents;
        var outTangents = path.outTangents;
        var vertices = path.vertices;
        if (Math.abs(trim.end - trim.start) < 0.001 || trim.end < trim.start) {
            return "";
        }
        else if (trim.start > 0.0 || trim.end < 1.0) {
            return this.trimmedPath(path, reverse, trim);
        }
        for (var index = 0; index < vertices.length; index++) {
            var element = vertices[index];
            element[0] += offset.x;
            element[1] += offset.y;
            vertices[index] = element;
        }
        var d = "";
        for (var index = 0; index <= vertices.length; index++) {
            var vertex = vertices[index];
            var it = inTangents[index];
            var ot = outTangents[index];
            if (index == 0) {
                d += "M" + vertex[0] + " " + vertex[1] + " ";
            }
            else if (index == vertices.length) {
                if (!path.closed) {
                    continue;
                }
                d += "C" + (vertices[index - 1][0] + outTangents[index - 1][0]) +
                    " " + (vertices[index - 1][1] + outTangents[index - 1][1]) +
                    " " + (vertices[0][0] + inTangents[0][0]) +
                    " " + (vertices[0][1] + inTangents[0][1]) +
                    " " + (vertices[0][0]) +
                    " " + (vertices[0][1]) +
                    " ";
            }
            else {
                d += "C" + (vertices[index - 1][0] + outTangents[index - 1][0]) +
                    " " + (vertices[index - 1][1] + outTangents[index - 1][1]) +
                    " " + (vertex[0] + inTangents[index][0]) +
                    " " + (vertex[1] + inTangents[index][1]) +
                    " " + (vertex[0]) +
                    " " + (vertex[1]) +
                    " ";
            }
        }
        if (path.closed) {
            d += "Z";
        }
        d = d.replace(/([0-9]+\.[0-9][0-9][0-9])[0-9]+/ig, "$1");
        return d;
    };
    Converter.prototype.requestShapes = function (frameConfig, layer) {
        var values = [];
        var step = 1.0 / this.proj.frameRate;
        for (var cTime = 0.0; cTime < frameConfig.duration; cTime += step) {
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
            var path = pathContents.valueAtTime(cTime, false);
            var style = this.requestShapeStyles(layer, parent, cTime);
            var trim = { start: 0.0, end: 1.0 };
            if (style.trim != null) {
                trim = style.trim;
            }
            var d = this.requestPath(path, { x: 0.0, y: 0.0 }, layer.property("Shape Direction").valueAtTime(cTime, false) === 3, trim);
            var shape = {
                type: "shape",
                args: {
                    d: d,
                },
                styles: this.requestShapeStyles(layer, parent, cTime),
                transform: this.requestShapeTransform(parent, cTime),
            };
            delete shape.styles["trim"];
            shapes.unshift(shape);
        }
        else if (layer.matchName == "ADBE Vector Shape - Ellipse") {
            var sizeContents = layer.property('Size');
            var size = sizeContents.valueAtTime(cTime, false);
            var positionContents = layer.property('Position');
            var position = positionContents.valueAtTime(cTime, false);
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
            var size = sizeContents.valueAtTime(cTime, false);
            var positionContents = layer.property('Position');
            var position = positionContents.valueAtTime(cTime, false);
            var shape = {
                type: "rect",
                args: {
                    x: position[0] - size[0] / 2.0,
                    y: position[1] - size[1] / 2.0,
                    width: size[0],
                    height: size[1],
                    cornerRadius: Math.min(size[0] / 2.0, layer.property('Roundness').valueAtTime(cTime, false)),
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
                for (var index = 0; index < numProperties; index += 1) {
                    var sublayer = contents.property(index + 1);
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
        for (var index = numProperties - 1; index >= 0; index -= 1) {
            var sublayer = contents.property(index + 1);
            if (!sublayer.enabled) {
                continue;
            }
            if (sublayer.matchName == "ADBE Vector Graphic - Fill") {
                styles.fill = sublayer.property('Color').valueAtTime(cTime, false);
            }
            else if (sublayer.matchName == "ADBE Vector Filter - Trim" || sublayer.matchName == "ADBE Vector Graphic - Trim") {
                styles.trim = {
                    start: sublayer.property('Start').valueAtTime(cTime, false) / 100.0,
                    end: sublayer.property('End').valueAtTime(cTime, false) / 100.0,
                };
            }
            else if (sublayer.matchName == "ADBE Vector Graphic - Stroke") {
                styles.stroke = sublayer.property('Color').valueAtTime(cTime, false);
                styles.strokeWidth = sublayer.property('Stroke Width').valueAtTime(cTime, false);
                var lineCap = sublayer.property('Line Cap').valueAtTime(cTime, false);
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
                var lineJoin = sublayer.property('Line Join').valueAtTime(cTime, false);
                switch (lineJoin) {
                    case 1:
                        styles.lineJoin = "miter";
                        styles.miterLimit = sublayer.property('Miter Limit').valueAtTime(cTime, false);
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
                                    dash = dashObject.property(j + 1).valueAtTime(cTime, false);
                                }
                                else if (dashObject.property(j + 1).matchName.indexOf('ADBE Vector Stroke Gap') !== -1) {
                                    gap = dashObject.property(j + 1).valueAtTime(cTime, false);
                                }
                                else if (dashObject.property(j + 1).matchName === 'ADBE Vector Stroke Offset') {
                                    offset = dashObject.property(j + 1).valueAtTime(cTime, false);
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
        var rotation = transform["Rotation"].valueAtTime(cTime, false);
        var ax = transform["Anchor Point"].valueAtTime(cTime, false)[0];
        var ay = transform["Anchor Point"].valueAtTime(cTime, false)[1];
        var sx = transform["Scale"].valueAtTime(cTime, false)[0] / 100.0;
        var sy = transform["Scale"].valueAtTime(cTime, false)[1] / 100.0;
        var tx = transform["Position"].valueAtTime(cTime, false)[0];
        var ty = transform["Position"].valueAtTime(cTime, false)[1];
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

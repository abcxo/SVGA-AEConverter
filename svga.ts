/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 * Build: npm install & npm start
 */

declare let app: any;
declare let $: any;
declare let Matrix: any;
declare let Folder: any;
declare let MaskMode: any;
declare let RQItemStatus: any;

namespace AE {

    export interface App {
        project: Project
    }

    export interface Project {
        activeItem: ActiveItem;
    }

    export interface ActiveItem {
        layers: AVLayer[]
        name: string;
        width: number;
        height: number;
        frameRate: number;
        duration: number;
    }

    export interface AVLayer {
        enabled: boolean;
        parent: AVLayer;
        source: Source;
        transform: Transform;
        width: number;
        height: number;
        startTime: number;
        inPoint: number;
        outPoint: number;
        mask: Mask;
        matchName: String;
        parentProperty?: AVLayer;
        property(key: string): any;
    }

    export interface Mask {
        numProperties: number;
    }

    export interface MaskElement {
        property(key: string): KeyframeValues;
        inverted: boolean;
        maskMode: number;
    }

    export interface MaskShape {
        closed: boolean;
    }

    export interface Source {
        name: string;
        file: File;
        layers: AVLayer[];
        numLayers: number;
        id: number;
    }

    export interface Transform {
        opacity: KeyframeValues;
    }

    export interface KeyframeValues {
        value: any;
        valueAtTime(time: number, preExpression: boolean): any;
    }

}

namespace SVGA {

    interface Project {
        name: string;
        width: number;
        height: number;
        frameRate: number;
        frameCount: number;
    }

    interface Resource {
        name: string;
        path: string;
        source: any;
        psdID: string;
    }

    interface Rect2D {
        x: number,
        y: number,
        width: number,
        height: number,
    }

    interface Matrix2D {
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
    }

    interface Shape2D {
        type: "shape" | "rect" | "ellipse" | "keep";
        args?: any;
        styles?: {
            fill: string;
            stroke: string;
            strokeWidth: number;
        };
    }

    interface Layer {
        name: string;
        values: {
            alpha: number[],
            layout: Rect2D[],
            matrix: Matrix2D[],
            mask: string[],
            shapes: Shape2D[][],
        };
    }

    export class Converter {

        app: AE.App = undefined;
        proj: Project = undefined;
        res: Resource[] = [];
        layers: Layer[] = [];

        constructor(app: AE.App) {
            this.app = app;
            this.loadProj();
            this.loadRes(app.project.activeItem.layers, app.project.activeItem.layers.length);
            this.loadLayer(app.project.activeItem.layers, app.project.activeItem.layers.length, undefined, undefined, []);
            this.mergeLayers();
        }

        loadProj() {
            this.proj = {
                name: this.app.project.activeItem.name,
                width: this.app.project.activeItem.width,
                height: this.app.project.activeItem.height,
                frameRate: this.app.project.activeItem.frameRate,
                frameCount: this.app.project.activeItem.frameRate * this.app.project.activeItem.duration,
            }
        }

        loadRes(layers: AE.AVLayer[], numLayers: number) {
            var m = {};
            for (var i = 1; i <= layers.length; i++) {
                var element = layers[i];
                if (element.enabled === false || element.source === null || element.source === undefined) {
                    continue;
                }
                if (element.source && element.source.file) {
                    if (m[element.source.id] === true) {
                        continue;
                    }
                    m[element.source.id] = true;
                    if ((element.source.file as any).fsName.indexOf(".psd") > 0) {
                        this.res.push({
                            name: "psd_" + element.source.id + ".png",
                            path: (element.source.file as any).fsName,
                            source: element.source,
                            psdID: element.source.id.toString(),
                        })
                    }
                    else {
                        var eName: string = element.source.name;
                        if (element.source.name.match(/[^a-zA-Z0-9\.\_\-]/)) {
                            eName = "img_" + element.source.id + ".png";
                        }
                        else {
                            eName = element.source.name;
                        }
                        this.res.push({
                            name: eName,
                            path: (element.source.file as any).fsName,
                            source: element.source,
                            psdID: undefined,
                        })
                    }
                }
                else if (element.source.numLayers > 0) {
                    this.loadRes(element.source.layers, element.source.numLayers);
                }
            }
        }

        loadLayer(layers: AE.AVLayer[], numLayers: number, parentValues: any, startTime: number, parents: AE.AVLayer[]) {
            for (var i = 1; i <= numLayers; i++) {
                var element = layers[i];
                if (element.enabled === false) {
                    continue;
                }
                if (element.matchName === "ADBE Vector Layer") {
                    let shapes = this.requestShapes(element);
                    this.layers.push({
                        name: ".vector",
                        values: {
                                alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                                layout: this.requestLayout(element.width, element.height),
                                matrix: this.requestMatrix(element.transform, element.width, element.height),
                                mask: this.requestMask(element),
                                shapes: this.requestShapes(element),
                        }
                    });
                }
                else if (element.source && element.source.file) {
                    var eName: string = element.source.name;
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
                                matrix: this.requestMatrix(element.transform, element.width, element.height),
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
                                matrix: this.requestMatrix(element.transform, element.width, element.height),
                                mask: this.requestMask(element),
                                shapes: [],
                            }
                        });
                    }
                }
                else if (element.source.numLayers > 0) {
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
                            matrix: this.requestMatrix(element.transform, element.width, element.height),
                            mask: [this.requestMask(element)],
                        }, element.width, element.height, startTime), element.startTime, nextParents);
                    }
                    else {
                        this.loadLayer(element.source.layers, element.source.numLayers, {
                            alpha: this.requestAlpha(element.transform.opacity, element.inPoint, element.outPoint),
                            layout: this.requestLayout(element.width, element.height),
                            matrix: this.requestMatrix(element.transform, element.width, element.height),
                            mask: [this.requestMask(element)],
                        }, element.startTime, nextParents);
                    }
                }
            }
        }

        concatValues(a: any, b: any, width: number, height: number, startTime: number): any {
            let c: any = JSON.parse(JSON.stringify(a));
            let startIndex = Math.round(startTime / (1.0 / this.proj.frameRate));
            for (let aIndex = startIndex, bIndex = 0; bIndex < b.alpha.length; aIndex++ , bIndex++) {
                if (aIndex < 0) {
                    continue;
                }
                c.alpha[aIndex] = b.alpha[bIndex] * a.alpha[aIndex];
            }
            for (let aIndex = startIndex, bIndex = 0; bIndex < b.layout.length; aIndex++ , bIndex++) {
                if (aIndex < 0) {
                    continue;
                }
                c.layout[aIndex] = b.layout[bIndex];
            }
            for (let aIndex = startIndex, bIndex = 0; bIndex < b.mask.length; aIndex++ , bIndex++) {
                if (aIndex < 0) {
                    continue;
                }
                c.mask[aIndex] = b.mask[bIndex];
            }
            for (let aIndex = startIndex, bIndex = 0; bIndex < b.matrix.length && aIndex < a.matrix.length; aIndex++ , bIndex++) {
                if (aIndex < 0) {
                    continue;
                }
                let matrix = new Matrix();
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
            for (let aIndex = startIndex, bIndex = 0; bIndex < b.mask.length; aIndex++ , bIndex++) {
                if (aIndex < 0) {
                    continue;
                }
                c.shapes[aIndex] = b.shapes[bIndex];
            }
            for (let index = 0; index < startIndex; index++) {
                delete c.alpha[index];
                delete c.layout[index];
                delete c.matrix[index];
                delete c.mask[index];
                delete c.shapes[index];
            }
            return c;
        }

        requestAlpha(prop: AE.KeyframeValues, inPoint: number, outPoint: number): any[] {
            let value: any[] = [];
            let step = 1.0 / this.proj.frameRate;
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
                value.push(prop.valueAtTime(cTime, false) / 100.0);
            }
            return value;
        }

        requestMatrix(transform: AE.Transform, width: number, height: number): Matrix2D[] {
            let value: Matrix2D[] = [];
            let step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                let rotation = transform["Rotation"].valueAtTime(cTime, false);
                let ax = transform["Anchor Point"].valueAtTime(cTime, false)[0];
                let ay = transform["Anchor Point"].valueAtTime(cTime, false)[1];
                let sx = transform["Scale"].valueAtTime(cTime, false)[0] / 100.0;
                let sy = transform["Scale"].valueAtTime(cTime, false)[1] / 100.0;
                let tx = transform["Position"].valueAtTime(cTime, false)[0];
                let ty = transform["Position"].valueAtTime(cTime, false)[1];
                let matrix = new Matrix();
                matrix.translate(-ax, -ay).scale(sx, sy).rotate(-rotation * Math.PI / 180);
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
        }

        requestLayout(width: number, height: number): Rect2D[] {
            let value: Rect2D[] = [];
            let step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                value.push({ x: 0, y: 0, width: width, height: height });
            }
            return value;
        }

        requestMask(layer: AE.AVLayer): string[] {
            if (layer.mask.numProperties > 0) {
                for (var index = 0; index < layer.mask.numProperties; index++) {
                    let masks: string[] = []
                    let maskElement: AE.MaskElement = (layer.mask as any)(index + 1);
                    let maskShape = maskElement.property('maskShape').value;
                    let closed = maskShape.closed;
                    let inverted = maskElement.inverted;
                    let mode = maskElement.maskMode;
                    let values: any[] = [];
                    let step = 1.0 / this.proj.frameRate;
                    for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                        let vertices = maskElement.property('maskShape').valueAtTime(cTime, true).vertices;
                        let solidPath = '';
                        let drawPath = '';
                        let finalPath = '';
                        if (inverted) {
                            solidPath = 'M0,0 ';
                            solidPath += ' h' + layer.width;
                            solidPath += ' v' + layer.height;
                            solidPath += ' h-' + layer.width;
                            solidPath += ' v-' + layer.height + ' ';
                        }
                        let lastPoint = undefined;
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
                        if (closed) {
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
        }

        requestShapes(layer: AE.AVLayer): Shape2D[][] {
            let values: Shape2D[][] = []
            let step = 1.0 / this.proj.frameRate;
            var lastValue: string = ""
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                let value = this.requestShapesAtTime(layer, cTime)
                if (lastValue === JSON.stringify(value)) {
                    let keep: Shape2D = {
                        type: "keep"
                    }
                    values.push([keep])
                }
                else {
                    lastValue = JSON.stringify(value)
                    values.push(value);
                }
            }
            return values;
        }

        requestShapesAtTime(layer: AE.AVLayer, cTime: number, parent?: AE.AVLayer): Shape2D[] {
            var shapes: Shape2D[] = []
            if (layer.matchName == "ADBE Vector Shape - Group") {
                let pathContents = layer.property('Path');
                let path = pathContents.valueAtTime(cTime, false);
                let inTangents = path.inTangents as number[][]
                let vertices = path.vertices as number[][]
                var d = ""
                for (var index = 0; index <= vertices.length; index++) {
                    var vertex: number[] = vertices[index];
                    var it = inTangents[index];
                    if (index == 0) {
                        d += "M " + vertex[0] + " " + vertex[1] + " ";
                    }
                    else if (index == vertices.length) {
                        d += "C " + (vertices[index - 1][0] - inTangents[index - 1][0]) + " " + (vertices[index - 1][1] - inTangents[index - 1][1]) + " " + 
                             (vertices[0][0] + inTangents[0][0]) + " " + (vertices[0][1] + inTangents[0][1]) + " " + 
                             (vertices[0][0]) + " " + (vertices[0][1]) + " ";
                    }
                    else {
                        d += "C " + (vertices[index - 1][0] - inTangents[index - 1][0]) + " " + (vertices[index - 1][1] - inTangents[index - 1][1]) + " " + 
                             (vertex[0] + inTangents[index][0]) + " " + (vertex[1] + inTangents[index][1]) + " " + 
                             (vertex[0]) + " " + (vertex[1]) + " ";
                    }
                }
                if (path.closed) {
                    d += "Z";
                }
                let shape: Shape2D = {
                    type: "shape",
                    args: {
                        d: d,
                    },
                    styles: this.requestShapeStyles(layer, parent, cTime)
                }
                shapes.push(shape);
            }
            else {
                let contents = layer.property('Contents');
                if (contents != null && contents != undefined) {
                    let numProperties: number = contents.numProperties;
                    for (let index = 0; index < numProperties; index += 1) {
                        let sublayer: AE.AVLayer = contents.property(index + 1);
                        let results = this.requestShapesAtTime(sublayer, cTime, layer);
                        for (var i = 0; i < results.length; i++) {
                            var element = results[i];
                            shapes.push(element);
                        }
                    }
                }
            }
            return shapes;
        }

        requestShapeStyles(layer: AE.AVLayer, parent: AE.AVLayer, cTime: number): any {
            let styles: any = {}
            let contents = parent.property('Contents');
            let numProperties: number = contents.numProperties
            for (let index = 0; index < numProperties; index += 1) {
                let sublayer: AE.AVLayer = contents.property(index + 1)
                if (sublayer.matchName == "ADBE Vector Graphic - Fill") {
                    styles.fill = sublayer.property('Color').valueAtTime(cTime, true)
                }
                else if (sublayer.matchName == "ADBE Vector Graphic - Stroke") {
                    styles.stroke = sublayer.property('Color').valueAtTime(cTime, true)
                    styles.strokeWidth = sublayer.property('Stroke Width').valueAtTime(cTime, true)
                }
            }
            return styles
        }

        mergeLayers() {
            let rangeLength = 1;
            for (let index = 0; index < this.layers.length; index += rangeLength) {
                let layer = this.layers[index];
                rangeLength = 1;
                for (let nIndex = index + 1; nIndex < this.layers.length; nIndex++) {
                    if (this.layers[nIndex].name === layer.name) {
                        rangeLength++;
                    }
                    else {
                        break;
                    }
                }
                if (rangeLength > 1) {
                    let maxInterSets = 1;
                    for (let frameNum = 0; frameNum < this.proj.frameCount; frameNum++) {
                        let thisMax = 0;
                        for (let checkIndex = index; checkIndex < index + rangeLength; checkIndex++) {
                            if (this.layers[checkIndex].values.alpha[frameNum] > 0.0) {
                                thisMax++;
                            }
                        }
                        maxInterSets = Math.max(maxInterSets, thisMax);
                    }
                    if (maxInterSets === 1 || maxInterSets === rangeLength) {
                        continue;
                    }
                    let mergedLayers: Layer[] = [];
                    for (let _ = 0; _ < maxInterSets; _++) {
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
                    for (let frameNum = 0; frameNum < this.proj.frameCount; frameNum++) {
                        let currentLayer = 0;
                        for (let checkIndex = index; checkIndex < index + rangeLength; checkIndex++) {
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
                    let replaceLayers = [];
                    let startInsertion = false;
                    for (let fIndex = 0; fIndex < this.layers.length; fIndex++) {
                        let element = this.layers[fIndex];
                        if (!startInsertion) {
                            if (fIndex < index) {
                                replaceLayers.push(element);
                            }
                            else {
                                startInsertion = true;
                                for (let mIndex = 0; mIndex < mergedLayers.length; mIndex++) {
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
        }
    }

    export class Writer {

        converter: Converter;
        outPath: string = app.project.file.path + "/svga_works";

        constructor(converter: Converter) {
            this.converter = converter;
        }

        write() {
            this.createOutputDirectories();
            this.copyImages();
            this.writeSpec();
        }

        createOutputDirectories() {
            let files = new Folder(this.outPath).getFiles();
            for (var index = 0; index < files.length; index++) {
                var element = files[index];
                element.remove();
            }
            new Folder(this.outPath).create();
        }

        copyImages() {
            let _File = File as any;
            for (var index = 0; index < this.converter.res.length; index++) {
                var element = this.converter.res[index];
                if (element.psdID !== undefined) {
                    this.saveSource(element);
                }
                else {
                    (new _File(element.path)).copy(new _File(this.outPath + "/" + element.name.replace(/\.png/ig, "").replace(/ /ig, "") + ".png"));
                }
            }
        }

        saveSource(element: Resource) {
            let _File = File as any;
            function storeRenderQueue() {
                var checkeds = [];
                for (var p = 1; p <= app.project.renderQueue.numItems; p++) {
                    if (app.project.renderQueue.item(p).status == RQItemStatus.RENDERING) {
                        checkeds.push("rendering");
                        break;
                    } else if (app.project.renderQueue.item(p).status == RQItemStatus.QUEUED) {
                        checkeds.push(p);
                        app.project.renderQueue.item(p).render = false;
                    }
                }
                return checkeds;
            }

            function restoreRenderQueue(checkedItems) {
                for (var q = 0; q < checkedItems.length; q++) {
                    app.project.renderQueue.item(checkedItems[q]).render = true;
                }
            }
            var currentSource = element.source;
            var helperComp = app.project.items.addComp('tempConverterComp', Math.max(4, currentSource.width), Math.max(4, currentSource.height), 1, 1, 1);
            helperComp.layers.add(currentSource, 0);
            helperComp.layers.add(currentSource, 1);
            helperComp.layers[2].remove();
            var RQbackup = storeRenderQueue();
            app.project.renderQueue.items.add(helperComp);
            app.project.renderQueue.item(app.project.renderQueue.numItems).render = true;
            var templateTemp = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).templates;
            var setPNG = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).templates[templateTemp.length - 1];
            app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).applyTemplate(setPNG);
            app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).file = new _File(this.outPath + "/psd_" + element.psdID + ".png");
            app.project.renderQueue.render();
            app.project.renderQueue.item(app.project.renderQueue.numItems).remove();
            if (RQbackup != null) {
                restoreRenderQueue(RQbackup);
            }
            helperComp.remove();
            (new _File(this.outPath + "/psd_" + element.psdID + ".png00000")).rename("psd_" + element.psdID + ".png");
        }

        writeSpec() {
            let _File = File as any;
            let spec = {
                ver: "1.1.0",
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
            }
            for (let index = 0; index < this.converter.res.length; index++) {
                let element = this.converter.res[index];
                spec.images[element.name.replace(/\.png/ig, "").replace(/ /ig, "")] = element.name.replace(/\.png/ig, "").replace(/ /ig, "");
            }
            for (let index = this.converter.layers.length - 1; index >= 0; index--) {
                let element = this.converter.layers[index];
                let frames = [];
                for (let index = 0; index < this.converter.proj.frameCount; index++) {
                    let obj = {
                        alpha: element.values.alpha[index],
                        layout: element.values.layout[index],
                        transform: element.values.matrix[index],
                        clipPath: element.values.mask[index],
                        shapes: element.values.shapes[index],
                    };
                    if (obj.alpha === undefined || obj.alpha <= 0.0) {
                        delete obj.alpha;
                        delete obj.layout;
                        delete obj.transform;
                        delete obj.clipPath;
                        delete obj.shapes;
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
                    frames.push(obj);
                }
                spec.sprites.push({
                    imageKey: element.name.replace(/\.png/ig, "").replace(/ /ig, ""),
                    frames: frames,
                })
            }
            let movieFile = new _File(this.outPath + "/movie.spec");
            if (movieFile.exists) {
                movieFile.remove();
            }
            movieFile.encoding = "UTF-8";
            movieFile.open('e', "TEXT", "????");
            movieFile.write(JSON.stringify(spec));
            movieFile.close();
        }

    }

}

let converter = new SVGA.Converter(app);
let writer = new SVGA.Writer(converter);
writer.write()
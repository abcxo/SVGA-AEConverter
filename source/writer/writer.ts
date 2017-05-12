/// <reference path="../app/svga.ts" />
/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 * Build: npm install & npm start
 */

class Writer {

    converter: Converter;
    outPath: string = app.project.file.path + "/svga_works";
    imageList: Array<string>;

    constructor(converter: Converter, outputPath: string) {
        this.converter = converter;
        if (outputPath != null){
            this.outPath = outputPath;
            this.imageList = [];
        }
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
        let saved = {};
        for (var index = 0; index < this.converter.res.length; index++) {
            var element = this.converter.res[index];

            this.imageList.push(element.name);

            if (element.psdID !== undefined) {
                if (saved[element.psdID] === true) {
                    continue;
                }
                saved[element.psdID] = true;
                this.saveSource(element);
            }
            else {
                (new _File(element.path)).copy(new _File(this.outPath + "/" + element.name.replace(/\.png/ig, "").replace(/ /ig, "") + ".png"));
            }
        }
    }

    saveSource(element: SVGA.Resource) {
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
            let lastShapeHash = "";
            for (let index = 0; index < this.converter.proj.frameCount; index++) {
                let obj = {
                    alpha: element.values.alpha[index],
                    layout: element.values.layout[index],
                    transform: element.values.matrix[index],
                    clipPath: element.values.mask[index],
                    shapes: element.values.shapes[index],
                };
                if (obj.alpha === undefined || obj.alpha <= 0.0 || (obj.transform !== undefined && (obj.transform.a == 0.0 || obj.transform.d == 0.0))) {
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
                else {
                    obj.transform.a = String(obj.transform.a).indexOf("e") > 0 ? obj.transform.a : parseFloat(obj.transform.a.toFixed(6))
                    obj.transform.b = String(obj.transform.b).indexOf("e") > 0 ? obj.transform.b : parseFloat(obj.transform.b.toFixed(6))
                    obj.transform.c = String(obj.transform.c).indexOf("e") > 0 ? obj.transform.c : parseFloat(obj.transform.c.toFixed(6))
                    obj.transform.d = String(obj.transform.d).indexOf("e") > 0 ? obj.transform.d : parseFloat(obj.transform.d.toFixed(6))
                    obj.transform.tx = String(obj.transform.tx).indexOf("e") > 0 ? obj.transform.tx : parseFloat(obj.transform.tx.toFixed(6))
                    obj.transform.ty = String(obj.transform.ty).indexOf("e") > 0 ? obj.transform.ty : parseFloat(obj.transform.ty.toFixed(6))
                }
                if (obj.clipPath === undefined || typeof obj.clipPath !== "string" || obj.clipPath === "") {
                    delete obj.clipPath;
                }
                if (obj.shapes != undefined && obj.shapes != null) {
                    for (let index = 0; index < obj.shapes.length; index++) {
                        let element = obj.shapes[index];
                        if (element.transform === undefined || (element.transform.a == 1.0 && element.transform.b == 0.0 && element.transform.c == 0.0 && element.transform.d == 1.0 && element.transform.tx == 0.0 && element.transform.ty == 0.0)) {
                            delete element.transform;
                        }
                        else {
                            element.transform.a = String(element.transform.a).indexOf("e") > 0 ? element.transform.a : parseFloat(element.transform.a.toFixed(6))
                            element.transform.b = String(element.transform.b).indexOf("e") > 0 ? element.transform.b : parseFloat(element.transform.b.toFixed(6))
                            element.transform.c = String(element.transform.c).indexOf("e") > 0 ? element.transform.c : parseFloat(element.transform.c.toFixed(6))
                            element.transform.d = String(element.transform.d).indexOf("e") > 0 ? element.transform.d : parseFloat(element.transform.d.toFixed(6))
                            element.transform.tx = String(element.transform.tx).indexOf("e") > 0 ? element.transform.tx : parseFloat(element.transform.tx.toFixed(6))
                            element.transform.ty = String(element.transform.ty).indexOf("e") > 0 ? element.transform.ty : parseFloat(element.transform.ty.toFixed(6))
                        }
                    }
                    if (lastShapeHash === JSON.stringify(obj.shapes)) {
                        obj.shapes = [
                            {
                                type: "keep",
                            }
                        ]
                    }
                    else {
                        lastShapeHash = JSON.stringify(obj.shapes);
                    }
                }
                else {
                    lastShapeHash = "";
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
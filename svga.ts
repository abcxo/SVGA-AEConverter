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
        source: Source;
        transform: Transform;
        width: number;
        height: number;
    }

    export interface Source {
        name: string;
        file: File;
        layers: AVLayer[];
        numLayers: number;
    }

    export interface Transform {
        opacity: KeyframeValues;
    }

    export interface KeyframeValues {
        valueAtTime(time: number, bool: boolean): any;
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

    interface Layer {
        name: string;
        values: {
            alpha: number[],
            layout: Rect2D[],
            matrix: Matrix2D[],
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
            this.loadLayer(app.project.activeItem.layers, app.project.activeItem.layers.length, undefined);
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
            for (var i = 1; i <= layers.length; i++) {
                var element = layers[i];
                if (element.enabled === false) {
                    continue;
                }
                if (element.source && element.source.file) {
                    this.res.push({
                        name: element.source.name,
                        path: (element.source.file as any).fsName,
                    })
                }
                else if (element.source.numLayers > 0) {
                    this.loadRes(element.source.layers, element.source.numLayers);
                }
            }
        }

        loadLayer(layers: AE.AVLayer[], numLayers: number, parentValues: any) {
            for (var i = 1; i <= numLayers; i++) {
                var element = layers[i];
                if (element.enabled === false) {
                    continue;
                }
                if (element.source && element.source.file) {
                    if (parentValues) {
                        this.layers.push({
                            name: element.source.name,
                            values: this.concatValues({
                                alpha: this.requestAlpha(element.transform.opacity),
                                layout: this.requestLayout(element.width, element.height),
                                matrix: this.requestMatrix(element.transform, element.width, element.height),
                            }, parentValues),
                        });
                    }
                    else {
                        this.layers.push({
                            name: element.source.name,
                            values: {
                                alpha: this.requestAlpha(element.transform.opacity),
                                layout: this.requestLayout(element.width, element.height),
                                matrix: this.requestMatrix(element.transform, element.width, element.height),
                            }
                        });
                    }
                }
                else if (element.source.numLayers > 0) {
                    this.loadLayer(element.source.layers, element.source.numLayers, {
                        alpha: this.requestAlpha(element.transform.opacity),
                        layout: this.requestLayout(element.width, element.height),
                        matrix: this.requestMatrix(element.transform, element.width, element.height),
                    });
                }
            }
        }

        concatValues(a: any, b: any): any {
            for (var index = 0; index < a.length; index++) {
                if (b[index].alpha !== undefined) {
                    a[index].alpha = a[index].alpha * b[index].alpha;
                }
                if (b[index].alpha !== undefined) {
                    a[index].alpha = a[index].alpha * b[index].alpha;
                }
            }
            return a;
        }

        requestAlpha(prop: AE.KeyframeValues): any[] {
            let value: any[] = [];
            let step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                value.push(prop.valueAtTime(cTime, true) / 100.0);
            }
            return value;
        }

        requestMatrix(transform: AE.Transform, width: number, height: number): Matrix2D[] {
            let value: Matrix2D[] = [];
            let step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                let rotation = transform["Rotation"].valueAtTime(cTime, true);
                let ax = transform["Anchor Point"].valueAtTime(cTime, true)[0];
                let ay = transform["Anchor Point"].valueAtTime(cTime, true)[1];
                let sx = transform["Scale"].valueAtTime(cTime, true)[0] / 100.0;
                let sy = transform["Scale"].valueAtTime(cTime, true)[1] / 100.0;
                let tx = transform["Position"].valueAtTime(cTime, true)[0];
                let ty = transform["Position"].valueAtTime(cTime, true)[1];
                let matrix = new Matrix();
                matrix.reset().rotate(rotation * Math.PI / 180).scale(sx, sy);
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
        }

        requestLayout(width: number, height: number): Rect2D[] {
            let value: Rect2D[] = [];
            let step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                value.push({ x: 0, y: 0, width: width, height: height });
            }
            return value;
        }

        convertMatrix(matrix: any, ax: number, ay: number, sx: number, sy: number, mtx: number, mty: number) {
            matrix.translate(mtx - (ax * sx), mty - (ay * sy));
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
            new Folder(this.outPath).create();
        }

        copyImages() {
            let _File = File as any;
            for (var index = 0; index < this.converter.res.length; index++) {
                var element = this.converter.res[index];
                (new _File(element.path)).copy(new _File(this.outPath + "/" + element.name.replace(/\.png/ig, "").replace(/ /ig, "") + ".png"));
            }
        }

        writeSpec() {
            let _File = File as any;
            let spec = {
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
/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
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
            this.loadRes(app.project.activeItem.layers);
            this.loadLayer();
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

        loadRes(layers: AE.AVLayer[]) {
            for (var i = 1; i <= layers.length; i++) {
                var element = layers[i];
                if (element.source && element.source.file) {
                    this.res.push({
                        name: element.source.name,
                        path: (element.source.file as any).fsName,
                    })
                }
                else if (element.source.numLayers > 0) {
                    this.loadRes(element.source.layers);
                }
            }
        }

        loadLayer() {
            var layers = this.app.project.activeItem.layers;
            for (var i = 1; i <= layers.length; i++) {
                var element = layers[i];
                this.layers.push({
                    name: element.source.name,
                    values: {
                        alpha: this.requestValue(element.transform.opacity),
                        matrix: this.requestMatrix(element.transform, element.width, element.height),
                    }
                })
            }
        }

        requestValue(prop: AE.KeyframeValues): any[] {
            let value: any[] = [];
            let step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                value.push(prop.valueAtTime(cTime, true));
            }
            return value;
        }

        requestMatrix(transform: AE.Transform, width: number, height: number): Matrix2D[] {
            let value: Matrix2D[] = [];
            let step = 1.0 / this.proj.frameRate;
            for (var cTime = 0.0; cTime < step * this.proj.frameCount; cTime += step) {
                let rotation = transform["Rotation"].valueAtTime(cTime, true);
                let sx = transform["Scale"].valueAtTime(cTime, true)[0] / 100.0;
                let sy = transform["Scale"].valueAtTime(cTime, true)[1] / 100.0;
                let tx = transform["Position"].valueAtTime(cTime, true)[0];
                let ty = transform["Position"].valueAtTime(cTime, true)[1];
                let matrix = new Matrix();
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
        }

        convertMatrix(matrix: any, mtx: number, mty: number, x: number, y: number, width: number, height: number) {
            let a = matrix.props[0];
            let b = matrix.props[1];
            let c = matrix.props[4];
            let d = matrix.props[5];
            let tx = matrix.props[12];
            let ty = matrix.props[13];
            let llx = a * x + c * y + tx;
            let lrx = a * (x + width) + c * y + tx;
            let lbx = a * x + c * (y + height) + tx;
            let rbx = a * (x + width) + c * (y + height) + tx;
            let lly = b * x + d * y + ty;
            let lry = b * (x + width) + d * y + ty;
            let lby = b * x + d * (y + height) + ty;
            let rby = b * (x + width) + d * (y + height) + ty;
            let nx = Math.min(lbx, rbx, llx, lrx);
            let ny = Math.min(lby, rby, lly, lry);
            matrix.translate(mtx - nx / 2.0, mty - ny / 2.0);
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
        }

        createOutputDirectories() {
            new Folder(this.outPath).create();
            new Folder(this.outPath + "/images").create();
        }

        copyImages() {
            for (var index = 0; index < this.converter.res.length; index++) {
                var element = this.converter.res[index];
                let _File = File as any;
                (new _File(element.path)).copy(new _File(this.outPath + "/images/" + element.name));   
            }
        }

    }

}

let converter = new SVGA.Converter(app);
let writer = new SVGA.Writer(converter);
writer.write()
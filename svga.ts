/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 */

declare let app: AE.App;
declare let $: any;

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
    }

    export interface Source {
        name: string;
        path: File;
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
        path: File;
    }

    interface Layer {
        name: string;
        values: {
            alpha: number[],
        };
    }

    export class Converter {

        app: AE.App;
        proj: Project;
        res: Resource[] = [];
        layers: Layer[] = [];

        constructor(app: AE.App) {
            this.app = app;
            this.loadProj();
            this.loadRes();
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

        loadRes() {
            var layers = this.app.project.activeItem.layers;
            for (var i = 1; i <= layers.length; i++) {
                var element = layers[i];
                this.res.push({
                    name: element.source.name,
                    path: element.source.path,
                })
            }
        }

        loadLayer() {
            var layers = this.app.project.activeItem.layers;
            for (var i = 1; i <= layers.length; i++) {
                var element = layers[i];
                this.layers.push({
                    name: element.source.name,
                    values: {
                        alpha: this.requestValue(element.transform.opacity)
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

    }
}

let converter = new SVGA.Converter(app);
$.write(converter.layers[0].values.alpha);
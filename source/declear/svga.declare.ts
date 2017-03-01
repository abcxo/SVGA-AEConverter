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
declare let Bezier: any;

namespace SVGA {

    export interface Project {
        name: string;
        width: number;
        height: number;
        frameRate: number;
        frameCount: number;
    }

    export interface Resource {
        name: string;
        path: string;
        source: any;
        psdID: string;
    }

    export interface Rect2D {
        x: number,
        y: number,
        width: number,
        height: number,
    }

    export interface Matrix2D {
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
    }

    export interface Shape2D {
        type: "shape" | "rect" | "ellipse" | "keep";
        args?: any;
        styles?: {
            fill: string;
            stroke: string;
            strokeWidth: number;
        };
        transform?: Matrix2D;
    }

    export interface Layer {
        name: string;
        values: {
            alpha: number[],
            layout: Rect2D[],
            matrix: Matrix2D[],
            mask: string[],
            shapes: Shape2D[][],
        };
    }

}


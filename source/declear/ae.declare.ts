/**
 * Author: Pony Cui
 * Date: 2016.08.01
 * Dev: TypeScript 1.8
 * Env: After Effects CC 2015
 * Build: npm install & npm start
 */

namespace AE {

    export interface App {
        project: Project
    }

    export interface Project {
        activeItem: ActiveItem;
        frameRate: number;
        duration: number;
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
        name: string;
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
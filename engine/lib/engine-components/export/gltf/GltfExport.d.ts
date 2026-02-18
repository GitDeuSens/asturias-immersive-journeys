import { Object3D, Vector3 } from "three";
import { type GLTFExporterOptions } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { BoxHelperComponent } from "../../BoxHelperComponent.js";
import { Behaviour } from "../../Component.js";
declare type ExportOptions = GLTFExporterOptions & {
    pivot?: Vector3;
    needleComponents?: boolean;
};
export declare const componentsArrayExportKey = "$___Export_Components";
export declare class GltfExportBox extends BoxHelperComponent {
    sceneRoot?: Object3D;
}
/**
 * GltfExport is a component that enables exporting selected 3D objects from the scene to the glTF format.
 * You can specify whether to export in binary format (.glb) or JSON format (.gltf), and select specific objects to include in the export.
 * The exported glTF file can be used in various 3D applications and engines that support the glTF standard.
 *
 * @summary Export selected 3D objects to glTF format
 * @category Asset Management
 * @group Components
 */
export declare class GltfExport extends Behaviour {
    binary: boolean;
    objects: Object3D[];
    private ext?;
    exportNow(name: string, opts?: ExportOptions): Promise<boolean>;
    export(objectsToExport: Object3D[], opts?: ExportOptions): Promise<any>;
    private static saveArrayBuffer;
    private static saveJson;
    private static save;
    private static collectAnimations;
    private static calculateCenter;
    private static filterTopmostParent;
}
export {};

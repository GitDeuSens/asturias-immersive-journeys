import { Loader } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Context } from "../engine_setup.js";
import { GLTF, type SourceIdentifier } from "../engine_types.js";
import { NEEDLE_components } from "./NEEDLE_components.js";
/**
 * Callback type for glTF import plugins. See {@link INeedleGLTFExtensionPlugin.onImport}
 */
export type OnImportCallback = (loader: GLTFLoader, url: string, context: Context) => void;
/**
 * Callback type for glTF export plugins. See {@link INeedleGLTFExtensionPlugin.onExport}
 */
export type OnExportCallback = (exporter: GLTFExporter, context: Context) => void;
/**
 * Interface for registering custom glTF extensions to the Needle Engine GLTFLoaders.
 * Register your plugin using the {@link addCustomExtensionPlugin} method
 */
export interface INeedleGLTFExtensionPlugin {
    /** The Name of your plugin */
    name: string;
    /** Called before starting to load a glTF file. This callback can be used to add custom extensions to the [GLTFLoader](https://threejs.org/docs/#GLTFLoader.register)
     *
     * @example Add a custom extension to the GLTFloader
     * ```ts
     * onImport: (loader, url, context) => {
     *    loader.register((parser) => new MyCustomExtension(parser));
     * }
     * ```
     */
    onImport?: OnImportCallback;
    /** Called after a glTF file has been loaded */
    onLoaded?: (url: string, gltf: GLTF, context: Context) => void;
    /** Called before starting to export a glTF file. This callback can be used to add custom extensions to the [GLTFExporter](https://threejs.org/docs/#examples/en/exporters/GLTFExporter.register)
     *
     * @example Add a custom extension to the GLTFExporter
     * ```ts
     * onExport: (exporter, context) => {
     *    exporter.register((writer) => new MyCustomExportExtension(writer));
     * }
     *
    */
    onExport?: OnExportCallback;
}
/** Register callbacks for registering custom gltf importer or exporter plugins */
export declare function addCustomExtensionPlugin(ext: INeedleGLTFExtensionPlugin): void;
/** Unregister callbacks for registering custom gltf importer or exporter plugins */
export declare function removeCustomImportExtensionType(ext: INeedleGLTFExtensionPlugin): void;
/** Registers the Needle Engine components extension */
export declare function registerComponentExtension(loader: GLTFLoader | Loader | object): NEEDLE_components | null;
export declare function registerExtensions(loader: GLTFLoader, context: Context, url: string, sourceId: SourceIdentifier): Promise<void>;
export declare function registerExportExtensions(exp: GLTFExporter, context: Context): void;
/** @internal */
export declare function invokeLoadedImportPluginHooks(url: string, gltf: GLTF, context: Context): void;

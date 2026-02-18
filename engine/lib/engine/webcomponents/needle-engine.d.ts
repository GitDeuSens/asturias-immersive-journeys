/// <reference types="webxr" />
import { Context } from "../engine_setup.js";
import { type INeedleEngineComponent, type LoadedModel } from "../engine_types.js";
declare global {
    interface HTMLElementTagNameMap {
        "needle-engine": NeedleEngineWebComponent;
    }
}
type TonemappingAttributeOptions = "none" | "linear" | "neutral" | "agx";
/**
 * The `<needle-engine>` web component. See {@link NeedleEngineAttributes} attributes for supported attributes
 * The web component creates and manages a Needle Engine context, which is responsible for rendering a 3D scene using threejs.
 * The context is created when the `src` attribute is set, and disposed when the element is removed from the DOM. You can prevent cleanup by setting the `keep-alive` attribute to `true`.
 * The context is accessible from the `<needle-engine>` element: `document.querySelector("needle-engine").context`.
 * See {@link https://engine.needle.tools/docs/reference/needle-engine-attributes}
 *
 * @example
 * <needle-engine src="https://example.com/scene.glb"></needle-engine>
 * @example
 * <needle-engine src="https://example.com/scene.glb" camera-controls="false"></needle-engine>
 */
export declare class NeedleEngineWebComponent extends HTMLElement implements INeedleEngineComponent {
    static get observedAttributes(): string[];
    get loadingProgress01(): number;
    get loadingFinished(): boolean;
    /**
     * If set to false the camera controls are disabled. Default is true.
     * @type {boolean | null}
     * @memberof NeedleEngineAttributes
     * @example
     * <needle-engine camera-controls="false"></needle-engine>
     * @example
     * <needle-engine camera-controls="true"></needle-engine>
     * @example
     * <needle-engine camera-controls></needle-engine>
     * @example
     * <needle-engine></needle-engine>
     * @returns {boolean | null} if the attribute is not set it returns null
     */
    get cameraControls(): boolean | null;
    set cameraControls(value: boolean | null);
    /**
     * Get the current context for this web component instance. The context is created when the src attribute is set and the loading has finished.
     * The context is disposed when the needle engine is removed from the document (you can prevent this by setting the keep-alive attribute to true).
     * @returns a promise that resolves to the context when the loading has finished
     */
    getContext(): Promise<Context>;
    /**
     * Get the context that is created when the src attribute is set and the loading has finished.
     */
    get context(): Context;
    private _context;
    private _overlay_ar;
    private _loadingProgress01;
    private _loadingView?;
    private _previousSrc;
    /** @private set to true after <needle-engine> did load completely at least once. Set to false when < to false when <needle-engine> is removed from the document removed from the document */
    private _didFullyLoad;
    constructor();
    /**
     * @internal
     */
    connectedCallback(): Promise<void>;
    /**
     * @internal
     */
    disconnectedCallback(): void;
    connectedMoveCallback(): void;
    /**
     * @internal
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /** The tonemapping setting configured as an attribute on the <needle-engine> component */
    get toneMapping(): TonemappingAttributeOptions | null | undefined;
    private _loadId;
    private _abortController;
    private _lastSourceFiles;
    private _createContextPromise;
    private onLoad;
    private applyAttributes;
    private onXRSessionStarted;
    /** called by the context when the first frame has been rendered */
    private onReady;
    private onError;
    private getSourceFiles;
    private checkIfSourceHasChanged;
    private _previouslyRegisteredMap;
    private ensureLoadStartIsRegistered;
    private registerEventFromAttribute;
    private setPublicKey;
    private setVersion;
    /**
     * @internal
     */
    getAROverlayContainer(): HTMLElement;
    /**
     * @internal
     */
    getVROverlayContainer(): HTMLElement | null;
    /**
     * @internal
     */
    onEnterAR(session: XRSession): void;
    /**
     * @internal
     */
    onExitAR(session: XRSession): void;
    /**
     * @internal
     */
    onEnterVR(session: XRSession): void;
    /**
     * @internal
     */
    onExitVR(session: XRSession): void;
    private onSetupAR;
    private onSetupVR;
    private onSetupDesktop;
    private setupElementsForMode;
    private foreachHtmlElement;
    private onBeforeBeginLoading;
    /** Change which model gets loaded. This will trigger a reload of the scene.
     * @example src="path/to/scene.glb"
     * @example src="[./path/scene1.glb, myOtherScene.gltf]"
     * */
    setAttribute(name: 'src', value: string): void;
    /** Optional. String attached to the context for caching/identification. */
    setAttribute(name: 'hash', value: string): void;
    /** Set to automatically add {@link OrbitControls} to the loaded scene */
    setAttribute(name: 'camera-controls', value: string): void;
    /** Override the default draco decoder path location. */
    setAttribute(name: 'dracoDecoderPath', value: string): void;
    /** Override the default draco library type. */
    setAttribute(name: 'dracoDecoderType', value: 'wasm' | 'js'): void;
    /** Override the default KTX2 transcoder/decoder path */
    setAttribute(name: 'ktx2DecoderPath', value: string): void;
    /** Prevent Needle Engine context from being disposed when the element is removed from the DOM */
    setAttribute(name: 'keep-alive', value: 'true' | 'false'): void;
    /** @private Public key used for licensing and feature gating. */
    setAttribute(name: 'public-key', value: string): void;
    /** @private Engine version string — usually set by the build/runtime. */
    setAttribute(name: 'version', value: string): void;
    /** URL to .exr, .hdr, .png, .jpg to be used as skybox */
    setAttribute(name: 'background-image', value: string): void;
    /** @private Rotation of the background image in degrees. */
    setAttribute(name: 'background-rotation', value: string | number): void;
    /** @deprecated Use 'environment-image' instead. */
    setAttribute(name: 'skybox-image', value: string): void;
    /** URL to .exr, .hdr, .png, .jpg to be used for lighting */
    setAttribute(name: 'environment-image', value: string): void;
    /** Intensity multiplier for environment lighting. */
    setAttribute(name: 'environment-intensity', value: string): void;
    /** Blurs the background image. Strength between 0 (sharp) and 1 (fully blurred). */
    setAttribute(name: 'background-blurriness', value: string): void;
    /** Intensity multiplier for the background image. */
    setAttribute(name: 'background-intensity', value: string): void;
    /**
     * CSS background color value to be used if no skybox or background image is provided.
     * @example "background-color='#ff0000'" will set the background color to red.
     */
    setAttribute(name: 'background-color', value: string): void;
    /** Enable/disable renderer canvas transparency. */
    setAttribute(name: 'transparent', value: 'true' | 'false'): void;
    /** Enable/disable contact shadows in the rendered scene */
    setAttribute(name: 'contact-shadows', value: 'true' | 'false'): void;
    /** Tonemapping mode. */
    setAttribute(name: 'tone-mapping', value: TonemappingAttributeOptions): void;
    /** Exposure multiplier for tonemapping. */
    setAttribute(name: 'tone-mapping-exposure', value: string): void;
    /** Defines a CSS selector or HTMLElement where the camera should be focused on. Content will be fit into this element. */
    setAttribute(name: 'focus-rect', value: string | HTMLElement): void;
    /** Allow pointer events to pass through transparent parts of the content to the underlying DOM elements. */
    setAttribute(name: 'clickthrough', value: 'true' | 'false'): void;
    /** Automatically fits the model into the camera view on load. */
    setAttribute(name: 'auto-fit', value: 'true' | 'false'): void;
    /** Automatically rotates the model until a user interacts with the scene. */
    setAttribute(name: 'auto-rotate', value: 'true' | 'false'): void;
    /** Play animations automatically on scene load */
    setAttribute(name: "autoplay", value: 'true' | 'false'): void;
    /** @private Used for switching the scene in SceneSwitcher */
    setAttribute(name: 'scene', value: string): void;
    /** @private Experimental.*/
    setAttribute(name: 'loading-blur', value: 'true' | 'false'): void;
    /** @private */
    setAttribute(name: 'alias', value: string): void;
    /** @private */
    setAttribute(name: 'hide-loading-overlay', value: 'true' | 'false'): void;
    /** @private */
    setAttribute(name: 'no-telemetry', value: 'true' | 'false'): void;
    /** Generic typed setter for known Needle Engine attributes */
    setAttribute(qualifiedName: ({} & string), value: string): void;
    /** Change which model gets loaded. This will trigger a reload of the scene.
     * @example src="path/to/scene.glb"
     * @example src="[./path/scene1.glb, myOtherScene.gltf]"
     * */
    getAttribute(name: 'src'): string | null;
    /** Optional. String attached to the context for caching/identification. */
    getAttribute(name: 'hash'): string | null;
    /** Set to automatically add {@link OrbitControls} to the loaded scene */
    getAttribute(name: 'camera-controls'): "true" | "false" | "none" | null;
    /** Override the default draco decoder path location. */
    getAttribute(name: 'dracoDecoderPath'): string | null;
    /** Override the default draco library type. */
    getAttribute(name: 'dracoDecoderType'): "wasm" | "js" | null;
    /** Override the default KTX2 transcoder/decoder path */
    getAttribute(name: 'ktx2DecoderPath'): string | null;
    /** Prevent Needle Engine context from being disposed when the element is removed from the DOM */
    getAttribute(name: 'keep-alive'): string | null;
    /** @private Public key used for licensing and feature gating. */
    getAttribute(name: 'public-key'): string | null;
    /** @private Engine version string — usually set by the build/runtime. */
    getAttribute(name: 'version'): string | null;
    /** URL to .exr, .hdr, .png, .jpg to be used as skybox */
    getAttribute(name: 'background-image'): string | null;
    /** @private Rotation of the background image in degrees. */
    getAttribute(name: 'background-rotation'): string | null;
    /** URL to .exr, .hdr, .png, .jpg to be used for lighting */
    getAttribute(name: 'environment-image'): string | null;
    /** Intensity multiplier for environment lighting. */
    getAttribute(name: 'environment-intensity'): string | null;
    /** Blurs the background image. Strength between 0 (sharp) and 1 (fully blurred). */
    getAttribute(name: 'background-blurriness'): string | null;
    /** Intensity multiplier for the background image. */
    getAttribute(name: 'background-intensity'): string | null;
    /**
     * CSS background color value to be used if no skybox or background image is provided.
     * @example "background-color='#ff0000'" will set the background color to red.
     */
    getAttribute(name: 'background-color'): string | null;
    /** Enable/disable renderer canvas transparency. */
    getAttribute(name: 'transparent'): string | null;
    /** Enable/disable contact shadows in the rendered scene */
    getAttribute(name: 'contact-shadows'): string | null;
    /** @deprecated Use 'contact-shadows' instead. */
    getAttribute(name: 'contactshadows'): string | null;
    /** Tonemapping mode. */
    getAttribute(name: 'tone-mapping'): TonemappingAttributeOptions | null;
    /** @deprecated Use 'tone-mapping' instead. */
    getAttribute(name: 'tonemapping'): TonemappingAttributeOptions | null;
    /** Exposure multiplier for tonemapping. */
    getAttribute(name: 'tone-mapping-exposure'): string | null;
    /** Defines a CSS selector or HTMLElement where the camera should be focused on. Content will be fit into this element. */
    getAttribute(name: 'focus-rect'): string | null;
    /** Allow pointer events to pass through transparent parts of the content to the underlying DOM elements. */
    getAttribute(name: 'clickthrough'): string | null;
    /** Automatically fits the model into the camera view on load. */
    getAttribute(name: 'auto-fit'): string | null;
    /** @deprecated Use 'auto-fit' instead. */
    getAttribute(name: 'autofit'): string | null;
    /** Automatically rotates the model until a user interacts with the scene. */
    getAttribute(name: 'auto-rotate'): string | null;
    /** Play animations automatically on scene load */
    getAttribute(name: "autoplay"): string | null;
    /** @private Used for switching the scene in SceneSwitcher */
    getAttribute(name: 'scene'): string | null;
    /** @private Experimental.*/
    getAttribute(name: 'loading-blur'): string | null;
    /** @private */
    getAttribute(name: 'alias'): string | null;
    /** @private */
    getAttribute(name: 'hide-loading-overlay'): string | null;
    /** @private */
    getAttribute(name: 'no-telemetry'): string | null;
    /** Typed getter for known NeedleEngine attribute names; returns the typed shape declared in NeedleEngineAttributes or null. */
    getAttribute(qualifiedName: ({} & string)): string | null;
    /**
     * Emitted when loading begins for the scene. The event is cancelable — calling `preventDefault()`
     * will stop the default loading UI behavior, so apps can implement custom loading flows.
     */
    addEventListener(type: 'loadstart', listener: (ev: CustomEvent<{
        context: Context;
        alias: string | null;
    }>) => void, options?: boolean | AddEventListenerOptions): void;
    /** Emitted repeatedly while loading resources. Use the event detail to show progress. */
    addEventListener(type: 'progress', listener: (ev: CustomEvent<{
        context: Context;
        name: string;
        progress: ProgressEvent<EventTarget>;
        index: number;
        count: number;
        totalProgress01: number;
    }>) => void, options?: boolean | AddEventListenerOptions): void;
    /** Emitted when scene loading has finished. */
    addEventListener(type: 'loadfinished', listener: (ev: CustomEvent<{
        context: Context;
        src: string | null;
        loadedFiles: LoadedModel[];
    }>) => void, options?: boolean | AddEventListenerOptions): void;
    /** Emitted when an XR session ends. */
    addEventListener(type: 'xr-session-ended', listener: (ev: CustomEvent<{
        session: XRSession | null;
        context: Context;
        sessionMode: XRSessionMode | undefined;
    }>) => void, options?: boolean | AddEventListenerOptions): void;
    /** Emitted when entering an AR session. */
    addEventListener(type: 'enter-ar', listener: (ev: CustomEvent<{
        session: XRSession;
        context: Context;
        htmlContainer: HTMLElement | null;
    }>) => void, options?: boolean | AddEventListenerOptions): void;
    /** Emitted when exiting an AR session. */
    addEventListener(type: 'exit-ar', listener: (ev: CustomEvent<{
        session: XRSession;
        context: Context;
        htmlContainer: HTMLElement | null;
    }>) => void, options?: boolean | AddEventListenerOptions): void;
    /** Emitted when entering a VR session. */
    addEventListener(type: 'enter-vr', listener: (ev: CustomEvent<{
        session: XRSession;
        context: Context;
    }>) => void, options?: boolean | AddEventListenerOptions): void;
    /** Emitted when exiting a VR session. */
    addEventListener(type: 'exit-vr', listener: (ev: CustomEvent<{
        session: XRSession;
        context: Context;
    }>) => void, options?: boolean | AddEventListenerOptions): void;
    /** Emitted when the engine has rendered its first frame and is ready. */
    addEventListener(type: 'ready', listener: (ev: Event) => void, options?: boolean | AddEventListenerOptions): void;
    /** Emitted when an XR session is started. You can do additional setup here. */
    addEventListener(type: 'xr-session-started', listener: (ev: CustomEvent<{
        session: XRSession;
        context: Context;
    }>) => void, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: ({} & K), listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
}
export {};

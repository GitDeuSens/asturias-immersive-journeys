import { Behaviour } from "./Component.js";
type MagicSkyboxName = "studio" | "blurred-skybox" | "quicklook-ar" | "quicklook";
type AnyString = string & {
    _brand?: never;
};
/**
 * RemoteSkybox is a component that allows you to set the skybox or environment texture of a scene from a URL, a local file or a static skybox name.
 * It supports .hdr, .exr, .jpg, .png files.
 *
 * ### Events
 * - `dropped-unknown-url`: Emitted when a file is dropped on the scene. The event detail contains the sender, the url and a function to apply the url.
 *
 * @example adding a skybox
 * ```ts
 * GameObject.addComponent(gameObject, Skybox, { url: "https://example.com/skybox.hdr", background: true, environment: true });
 * ```
 *
 * @example handle custom url
 * ```ts
 * const skybox = GameObject.addComponent(gameObject, Skybox);
 * skybox.addEventListener("dropped-unknown-url", (evt) => {
 *    let url = evt.detail.url;
 *    console.log("User dropped file", url);
 *    // change url or resolve it differently
 *    url = "https://example.com/skybox.hdr";
 *    // apply the url
 *    evt.detail.apply(url);
 * });
 * ```
 *
 * @example update skybox url
 * ```ts
 * skybox.setSkybox("https://example.com/skybox.hdr");
 * ```
 *
 * @summary Sets the skybox or environment texture of a scene
 * @category Rendering
 * @group Components
 */
export declare class RemoteSkybox extends Behaviour {
    /**
     * URL to a remote skybox.
     * To update the skybox/environment map use `setSkybox(url)`.
     *
     * The url can also be set to a magic skybox name.
     * Magic name options are: "quicklook", "quicklook-ar", "studio", "blurred-skybox".
     * These will resolve to built-in skyboxes hosted on the Needle CDN that are static, optimized for the web and will never change.
     *
     * @example
     * ```ts
     * skybox.url = "https://example.com/skybox.hdr";
     * ```
     */
    url: MagicSkyboxName | AnyString;
    /**
     * When enabled a user can drop a link to a skybox image on the scene to set the skybox.
     * @default true
     */
    allowDrop: boolean;
    /**
     * When enabled the skybox will be set as the background of the scene.
     * @default true
     */
    background: boolean;
    /**
     * When enabled the skybox will be set as the environment of the scene (to be used as environment map for reflections and lighting)
     * @default true
     */
    environment: boolean;
    /**
     * When enabled dropped skybox urls (or assigned skybox urls) will be networked to other users in the same networked room.
     * @default true
     */
    allowNetworking: boolean;
    private _prevUrl?;
    private _prevLoadedEnvironment?;
    private _prevEnvironment;
    private _prevBackground;
    /** @internal */
    onEnable(): void;
    /** @internal */
    onDisable(): void;
    private urlChangedSyncField;
    /**
     * Set the skybox from a given url
     * @param url The url of the skybox image
     * @param name Define name of the file with extension if it isn't apart of the url
     * @returns Whether the skybox was successfully set
     */
    setSkybox(url: MagicSkyboxName | AnyString | undefined | null, name?: string): Promise<boolean>;
    private apply;
    private readonly validProtocols;
    private readonly validTextureTypes;
    private isRemoteTexture;
    private isValidTextureType;
    private registerDropEvents;
    private unregisterDropEvents;
    private onDragOverEvent;
    private onDrop;
}
export {};

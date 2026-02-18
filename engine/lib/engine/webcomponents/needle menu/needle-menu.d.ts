import type { Context } from "../../engine_context.js";
import { NeedleLogoElement } from "../logo-element.js";
declare global {
    interface HTMLElementTagNameMap {
        "needle-logo-element": NeedleLogoElement;
    }
}
/** This is the model for the postMessage event that the needle engine will send to create menu items */
export declare type NeedleMenuPostMessageModel = {
    type: "needle:menu";
    button?: {
        label?: string;
        /** Google icon name */
        icon?: string;
        /** currently only URLs are supported */
        onclick?: string;
        target?: "_blank" | "_self" | "_parent" | "_top";
        /** Low priority is icon is on the left, high priority is icon is on the right. Default is 0 */
        priority?: number;
    };
};
/**
 * Used by the NeedleMenuElement to create a button at {@link NeedleMenuElement#appendChild}
 */
export declare type ButtonInfo = {
    /** Invoked when the button is clicked */
    onClick: (evt: Event) => void;
    /** Visible button text */
    label: string;
    /** Material icon name: https://fonts.google.com/icons */
    icon?: string;
    /** "left" or "right" to place the icon on the left or right side of the button. Default is "left" */
    iconSide?: "left" | "right";
    /**
     * Priority controls the order of buttons in the menu.
     * If not enough space is available to show all buttons - the highest priority elements will always be visible
     *
     * **Sorting**
     * Low priority is icon is on the left,
     * high priority is icon is on the right.
     * @default undefined
     */
    priority?: number;
    /** Experimental. Allows to put two buttons in one row for the compact layout */
    class?: "row2";
    title?: string;
};
/**
 * The NeedleMenu is a menu that can be displayed in the needle engine webcomponent or in VR/AR sessions.
 *
 * The menu can be used to add buttons to the needle engine that can be used to interact with the application.
 *
 * The menu can be positioned at the top or the bottom of the <needle-engine> webcomponent.
 *
 * @example Add a new button using the NeedleMenu
 * ```typescript
 * onStart(ctx => {
 *   ctx.menu.appendChild({
 *    label: "Open Google",
 *    icon: "google",
 *    onClick: () => { window.open("https://www.google.com", "_blank") }
 *   });
 * })
 * ```
 *
 * Buttons can be added to the menu using the {@link NeedleMenu#appendChild} method or by sending a postMessage event to the needle engine with the type "needle:menu". Use the {@link NeedleMenuPostMessageModel} model to create buttons with postMessage.
 * @example Create a button using a postmessage
 * ```javascript
 * window.postMessage({
 *    type: "needle:menu",
 *    button: {
 *      label: "Open Google",
 *      icon: "google",
 *      onclick: "https://www.google.com",
 *      target: "_blank",
 *    }
 * }, "*");
 * ```
 *
 * @example Access the menu from a component
 * ```typescript
 * import { Behaviour, OnStart } from '@needle-tools/engine';
 *
 * export class MyComponent extends Behaviour {
 *
 *   start() {
 *    this.context.menu.appendChild({ ... });
 *   }
 * }
 * ```
 *
 * @category HTML
 */
export declare class NeedleMenu {
    static setElementPriority(button: HTMLElement, priority: number): void;
    static getElementPriority(button: HTMLElement): number | undefined;
    private readonly _context;
    private readonly _menu;
    private readonly _spatialMenu;
    constructor(context: Context);
    /** @ignore internal method */
    onDestroy(): void;
    private onPostMessage;
    private onStartXR;
    private onExitXR;
    /** Experimental: Change the menu position to be at the top or the bottom of the needle engine webcomponent
     * @param position "top" or "bottom"
     */
    setPosition(position: "top" | "bottom"): void;
    /**
     * Call to show or hide the menu.
     * NOTE: Hiding the menu is a PRO feature and requires a needle engine license. Hiding the menu will not work in production without a license.
     */
    setVisible(visible: boolean): void;
    /** When set to false, the Needle Engine logo will be hidden. Hiding the logo requires a needle engine license */
    showNeedleLogo(visible: boolean): void;
    /** @returns true if the logo is visible */
    get logoIsVisible(): boolean;
    /** When enabled=true the menu will be visible in VR/AR sessions */
    showSpatialMenu(enabled: boolean): void;
    setSpatialMenuVisible(display: boolean): void;
    get spatialMenuIsVisible(): boolean | undefined;
    /**
     * Call to add or remove a button to the menu to show a QR code for the current page
     * If enabled=true then a button will be added to the menu that will show a QR code for the current page when clicked.
     */
    showQRCodeButton(enabled: boolean | "desktop-only"): HTMLButtonElement | null;
    /** Call to add or remove a button to the menu to mute or unmute the application
     * Clicking the button will mute or unmute the application
    */
    showAudioPlaybackOption(visible: boolean): void;
    private _muteButton?;
    showFullscreenOption(visible: boolean): void;
    private _fullscreenButton?;
    appendChild(child: HTMLElement | ButtonInfo): HTMLElement;
}
/**
 * `<needle-menu>` web component — lightweight menu used by Needle Engine.
 *
 * This element is intended as an internal UI primitive for hosting application
 * menus and buttons. Use the higher-level `NeedleMenu` API from the engine
 * code to manipulate it programmatically. Public DOM-facing methods are
 * documented (appendChild / append / prepend / setPosition / setVisible).
 *
 * @element needle-menu
 */
export declare class NeedleMenuElement extends HTMLElement {
    #private;
    static create(): HTMLElement;
    static getOrCreate(domElement: HTMLElement, context: Context): NeedleMenuElement;
    private _domElement;
    private _context;
    constructor();
    private _sizeChangeInterval;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /** @private user preference for logo visibility */
    private _userRequestedLogoVisible?;
    showNeedleLogo(visible: boolean): void;
    /** @returns true if the logo is visible */
    get logoIsVisible(): boolean;
    private ___onSetLogoVisible;
    setPosition(position: "top" | "bottom"): void;
    /** @private user preference for menu visibility */
    private _userRequestedMenuVisible?;
    setVisible(visible: boolean): void;
    /**
     * If the menu is in compact mode and the foldout is currently open (to show all menu options) then this will close the foldout
     */
    closeFoldout(): void;
    /** @private root container element inside shadow DOM */
    private readonly root;
    /** @private wraps the whole content (internal layout) */
    private readonly wrapper;
    /** @private contains the buttons and dynamic elements */
    private readonly options;
    /** @private contains options visible when in compact mode */
    private readonly optionsCompactMode;
    /** @private contains the needle-logo html element */
    private readonly logoContainer;
    /** @private compact menu button element */
    private readonly compactMenuButton;
    /** @private foldout container used in compact mode */
    private readonly foldout;
    private readonly trackedElements;
    private trackElement;
    append(...nodes: (string | Node)[]): void;
    /**
     * Appends a button or HTML element to the needle-menu options.
     * @param node a Node or ButtonInfo to create a button from
     * @returns the appended Node
     *
     * @example Append a button
     * ```javascript
     * const button = document.createElement("button");
     * button.textContent = "Click Me";
     * needleMenu.appendChild(button);
     * ```
     * @example Append a button using ButtonInfo
     * ```javascript
     * needleMenu.appendChild({
     *    label: "Click Me",
     *    onClick: () => { alert("Button clicked!"); },
     *    icon: "info",
     *    title: "This is a button",
     * });
     * ```
     */
    appendChild<T extends Node>(node: T | ButtonInfo): T;
    prepend(...nodes: (string | Node)[]): void;
    private _isHandlingChange;
    /** During modification of options container (e.g. when moving items into the extra buttons container) the mutation observer should not trigger an update event immediately. This is a workaround for the total size required for all elements not being calculated reliably. */
    private _pauseMutationObserverOptionsContainer;
    /** Called when any change in the web component is detected (including in children and child attributes) */
    private onChangeDetected;
    private onOptionsChildrenChanged;
    private _didSort;
    /** checks if the menu has any content and should be rendered at all
     * if we dont have any content and logo then we hide the menu
     */
    private handleMenuVisible;
    /** @returns true if we have any content OR a logo */
    get hasAnyContent(): boolean;
    get hasAnyVisibleOptions(): boolean;
    private _lastAvailableWidthChange;
    private _timeoutHandleSize;
    private _timeoutHandleCompactItems;
    private handleSizeChange;
    private updateCompactFoldoutItem;
    private ___insertDebugOptions;
}

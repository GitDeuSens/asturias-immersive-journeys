declare global {
    interface HTMLElementTagNameMap {
        "needle-logo-element": NeedleLogoElement;
    }
}
/**
 * Needle logo web component used in the hosting UI (small, compact logo or full)
 * @element needle-logo-element
 */
export declare class NeedleLogoElement extends HTMLElement {
    static get elementName(): string;
    static create(): NeedleLogoElement;
    constructor();
    private readonly _root;
    private readonly wrapper;
    private readonly logoElement;
    /** Show or hide the logo element (used by the menu) */
    setLogoVisible(val: boolean): void;
    /** Switch the logo between full and compact versions */
    setType(type: "full" | "compact"): void;
}

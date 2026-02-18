import { Behaviour } from "../Component.js";
import { type ICanvasGroup } from "./Interfaces.js";
/**
 * CanvasGroup is a UI component that allows you to control the transparency and interactivity of a group of UI elements.
 * By adjusting the alpha property, you can fade in or out all child UI elements simultaneously.
 * The interactable and blocksRaycasts properties let you enable or disable user interaction for the entire group.
 * @summary Group UI elements to control transparency and interactivity
 * @category User Interface
 * @group Components
 */
export declare class CanvasGroup extends Behaviour implements ICanvasGroup {
    get alpha(): number;
    set alpha(val: number);
    get isCanvasGroup(): boolean;
    private _alpha;
    interactable: boolean;
    blocksRaycasts: boolean;
    private _isDirty;
    private markDirty;
    private applyChangesDelayed;
    private _buffer;
    private applyChangesNow;
}

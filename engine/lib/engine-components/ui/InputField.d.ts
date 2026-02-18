import { Behaviour } from "../Component.js";
import { EventList } from "../EventList.js";
import { type IPointerEventHandler, PointerEventData } from "./PointerEvents.js";
/**
 * InputField is a UI component that allows users to enter and edit text.
 * It provides a text input area where users can type, delete, and modify text.
 * The InputField supports placeholder text, events for value changes, and end edit actions.
 * @summary Text field for user input
 * @category User Interface
 * @group Components
 */
export declare class InputField extends Behaviour implements IPointerEventHandler {
    get text(): string;
    set text(value: string);
    get isFocused(): boolean;
    private textComponent?;
    private placeholder?;
    onValueChanged?: EventList<any>;
    onEndEdit?: EventList<any>;
    private static active;
    private static activeTime;
    private static htmlField;
    private static htmlFieldFocused;
    private inputEventFn;
    private _iosEventFn;
    start(): void;
    onEnable(): void;
    onDisable(): void;
    /** Clear the input field if it's currently active */
    clear(): void;
    /** Select the input field, set it active to receive keyboard input */
    select(): void;
    /** Deselect the input field, stop receiving keyboard input */
    deselect(): void;
    onPointerEnter(_args: PointerEventData): void;
    onPointerExit(_args: PointerEventData): void;
    onPointerClick(_args: any): void;
    private activeLoop;
    private onSelected;
    private onDeselected;
    update(): void;
    private onInput;
    private setTextFromInputField;
    private selectInputField;
    private processInputOniOS;
}

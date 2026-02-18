import { RGBAColor } from "../../engine/js-extensions/index.js";
import { Animator } from "../Animator.js";
import { Behaviour } from "../Component.js";
import { EventList } from "../EventList.js";
import type { IPointerEventHandler, PointerEventData } from "./PointerEvents.js";
export declare enum Transition {
    None = 0,
    ColorTint = 1,
    SpriteSwap = 2,
    Animation = 3
}
declare class ButtonColors {
    colorMultiplier: 1;
    disabledColor: RGBAColor;
    fadeDuration: number;
    highlightedColor: RGBAColor;
    normalColor: RGBAColor;
    pressedColor: RGBAColor;
    selectedColor: RGBAColor;
}
declare class AnimationTriggers {
    disabledTrigger: string;
    highlightedTrigger: string;
    normalTrigger: string;
    pressedTrigger: string;
    selectedTrigger: string;
}
/**
 * Button is a UI component that can be clicked by the user to perform an action.
 * It supports different visual states such as normal, highlighted, pressed, and disabled.
 * You can customize the button's appearance using colors or animations for each state.
 * @summary UI Button that can be clicked to perform actions
 * @category User Interface
 * @group Components
 */
export declare class Button extends Behaviour implements IPointerEventHandler {
    /**
     * Invokes the onClick event
     */
    click(): void;
    onClick: EventList<void>;
    private _isHovered;
    onPointerEnter(evt: PointerEventData): void;
    onPointerExit(): void;
    onPointerDown(_: any): void;
    onPointerUp(_: any): void;
    onPointerClick(args: PointerEventData): void;
    colors?: ButtonColors;
    transition?: Transition;
    animationTriggers?: AnimationTriggers;
    animator?: Animator;
    set interactable(value: boolean);
    get interactable(): boolean;
    private _interactable;
    private set_interactable;
    awake(): void;
    start(): void;
    onEnable(): void;
    onDestroy(): void;
    private _requestedAnimatorTrigger?;
    private setAnimatorTriggerAtEndOfFrame;
    private _isInit;
    private _image?;
    private init;
    private stateSetup;
    private getFinalColor;
}
export {};

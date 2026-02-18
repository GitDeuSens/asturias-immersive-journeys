import { Color, Vector2 } from "three"

import { serializable } from "../../engine/engine_serialization.js";
import { RGBAColor } from "../../engine/js-extensions/index.js";
import { Behaviour } from "../Component.js";

/**
 * Outline is a UI component that adds an outline effect to UI elements.  
 * You can customize the outline color and distance to create a visual border around the UI element.
 * @summary Add an outline effect to UI elements
 * @category User Interface
 * @group Components
 */
export class Outline extends Behaviour {

    @serializable(RGBAColor)
    effectColor?: RGBAColor;

    @serializable(Vector2)
    effectDistance?: Vector2;
}
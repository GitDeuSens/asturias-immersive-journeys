import { PostProcessingEffect } from "../PostProcessingEffect.js";
/**
 * Sharpening effect enhances the details and edges in the rendered scene by increasing the contrast between adjacent pixels.
 * This effect can make textures and fine details appear clearer and more defined, improving the overall visual quality of the scene.
 * It is particularly useful in scenes where details may be lost due to blurriness or low resolution.
 * @summary Sharpening Post-Processing Effect
 * @category Effects
 * @group Components
 */
export declare class SharpeningEffect extends PostProcessingEffect {
    get typeName(): string;
    order: number | undefined;
    private _effect?;
    onCreateEffect(): any;
    private get effect();
    set amount(value: number);
    get amount(): number;
    private _amount;
    set radius(value: number);
    get radius(): number;
    private _radius;
}

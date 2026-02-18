import { type EffectProviderResult, PostProcessingEffect } from "../PostProcessingEffect.js";
import { VolumeParameter } from "../VolumeParameter.js";
/**
 * Pixelation effect simulates a pixelated look by enlarging pixels in the rendered scene.
 * This effect can be used to achieve a retro or stylized visual aesthetic, reminiscent of early video games or low-resolution graphics.
 * @summary Pixelation Post-Processing Effect
 * @category Effects
 * @group Components
 */
export declare class PixelationEffect extends PostProcessingEffect {
    get typeName(): string;
    readonly granularity: VolumeParameter;
    onCreateEffect(): EffectProviderResult;
}

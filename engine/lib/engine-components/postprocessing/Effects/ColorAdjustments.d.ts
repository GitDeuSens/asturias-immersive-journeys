import { type EffectProviderResult, PostProcessingEffect } from "../PostProcessingEffect.js";
import { VolumeParameter } from "../VolumeParameter.js";
/**
 * Color Adjustments effect allows you to modify the overall color properties of the rendered scene, including post-exposure, contrast, hue shift, and saturation.
 * These adjustments can be used to enhance the visual aesthetics of the scene or to achieve specific artistic effects.
 * @summary Color Adjustments Post-Processing Effect
 * @category Effects
 * @group Components
 */
export declare class ColorAdjustments extends PostProcessingEffect {
    get typeName(): string;
    /**
     * Whether values for contrast, hueshift or saturation are remapped to a different range.
     */
    remap: boolean;
    readonly postExposure: VolumeParameter;
    /**
     * Range -1 to 1, where 0 is the default value, -1 is the lowest contrast and 1 is the highest contrast.
     * @default 0
     */
    readonly contrast: VolumeParameter;
    readonly hueShift: VolumeParameter;
    readonly saturation: VolumeParameter;
    init(): void;
    onCreateEffect(): EffectProviderResult;
}

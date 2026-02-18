import { type EffectProviderResult, PostProcessingEffect } from "../PostProcessingEffect.js";
import { VolumeParameter } from "../VolumeParameter.js";
/**
 * Chromatic Aberration effect simulates the color fringing effect seen in real-world cameras.
 * It offsets the red, green, and blue color channels to create a distorted, colorful edge around objects.
 * This effect can enhance the visual appeal of scenes by adding a subtle or pronounced chromatic distortion.
 * @summary Chromatic Aberration Post-Processing Effect
 * @category Effects
 * @group Components
 */
export declare class ChromaticAberration extends PostProcessingEffect {
    get typeName(): string;
    readonly intensity: VolumeParameter;
    onCreateEffect(): EffectProviderResult;
}

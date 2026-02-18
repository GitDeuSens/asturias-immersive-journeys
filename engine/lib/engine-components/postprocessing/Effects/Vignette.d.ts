import { type EffectProviderResult, PostProcessingEffect } from "../PostProcessingEffect.js";
import { VolumeParameter } from "../VolumeParameter.js";
/**
 * Vignette effect darkens the edges of the rendered scene to draw attention to the center.
 * This effect simulates the natural vignetting that occurs in photography and cinematography, where the corners of an image are darker than the center.
 * It can be used to enhance the visual focus on the main subject of the scene and create a more immersive viewing experience.
 * @summary Vignette Post-Processing Effect
 * @category Effects
 * @group Components
 */
export declare class Vignette extends PostProcessingEffect {
    get typeName(): string;
    color: VolumeParameter;
    intensity: VolumeParameter;
    center: VolumeParameter;
    init(): void;
    onCreateEffect(): EffectProviderResult;
    private updateDarkness;
}

import { type EffectProviderResult, PostProcessingEffect } from "../PostProcessingEffect.js";
import { VolumeParameter } from "../VolumeParameter.js";
/**
 * Tilt Shift effect simulates a miniature scene by applying a selective focus blur to the rendered image.
 * This effect creates a shallow depth of field, making real-world scenes appear as if they are small-scale models.
 * It is often used in photography and cinematography to draw attention to specific areas of the scene while blurring out the rest.
 * @summary Tilt Shift Post-Processing Effect
 * @category Effects
 * @group Components
 */
export declare class TiltShiftEffect extends PostProcessingEffect {
    get typeName(): string;
    offset: VolumeParameter;
    rotation: VolumeParameter;
    focusArea: VolumeParameter;
    feather: VolumeParameter;
    kernelSize: VolumeParameter;
    resolutionScale: VolumeParameter;
    init(): void;
    onCreateEffect(): EffectProviderResult | undefined;
}

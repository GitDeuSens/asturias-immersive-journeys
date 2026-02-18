import type { DepthOfFieldEffect } from "postprocessing";
import { PostProcessingEffect } from "../PostProcessingEffect.js";
import { VolumeParameter } from "../VolumeParameter.js";
export declare enum DepthOfFieldMode {
    Off = 0,
    Gaussian = 1,
    Bokeh = 2
}
/**
 * Depth of Field effect simulates the focusing behavior of real-world cameras by blurring objects that are outside the focal plane.
 * This effect enhances the sense of depth in a scene by mimicking how cameras focus on subjects at varying distances, creating a more immersive visual experience.
 * It can be adjusted to achieve different artistic effects, from subtle background blurring to pronounced bokeh effects.
 * @summary Depth of Field Post-Processing Effect
 * @category Effects
 * @group Components
 */
export declare class DepthOfField extends PostProcessingEffect {
    get typeName(): string;
    mode: DepthOfFieldMode;
    readonly focusDistance: VolumeParameter;
    readonly focalLength: VolumeParameter;
    readonly aperture: VolumeParameter;
    readonly gaussianMaxRadius: VolumeParameter;
    readonly resolutionScale: VolumeParameter;
    readonly bokehScale: VolumeParameter;
    init(): void;
    onCreateEffect(): DepthOfFieldEffect[] | undefined;
    unapply(): void;
}

import { EffectProviderResult, PostProcessingEffect } from "../PostProcessingEffect.js";
import { VolumeParameter } from "../VolumeParameter.js";
import { NEToneMappingModeNames } from "./Tonemapping.utils.js";
/**
 * Tonemapping effect adjusts the brightness and contrast of the rendered scene to map high dynamic range (HDR) colors to a displayable range.
 * This effect is essential for achieving realistic lighting and color representation in 3D scenes, as it helps to preserve details in both bright and dark areas.
 * Various tonemapping algorithms can be applied to achieve different visual styles and effects.
 * @summary Tonemapping Post-Processing Effect
 * @category Effects
 * @group Components
 */
export declare class ToneMappingEffect extends PostProcessingEffect {
    get typeName(): string;
    readonly mode: VolumeParameter;
    readonly exposure: VolumeParameter;
    /** Set the tonemapping mode to e.g. "agx" */
    setMode(mode: NEToneMappingModeNames): this;
    get isToneMapping(): boolean;
    onEffectEnabled(): void;
    private _tonemappingEffect;
    onCreateEffect(): EffectProviderResult | undefined;
    onBeforeRender(): void;
}

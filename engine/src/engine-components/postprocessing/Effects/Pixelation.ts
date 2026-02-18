import type { PixelationEffect as PixelationEffectPP } from "postprocessing";

import { MODULES } from "../../../engine/engine_modules.js";
import { serializable } from "../../../engine/engine_serialization.js";
import { type EffectProviderResult, PostProcessingEffect } from "../PostProcessingEffect.js";
import { VolumeParameter } from "../VolumeParameter.js";
import { registerCustomEffectType } from "../VolumeProfile.js";

/**
 * Pixelation effect simulates a pixelated look by enlarging pixels in the rendered scene.  
 * This effect can be used to achieve a retro or stylized visual aesthetic, reminiscent of early video games or low-resolution graphics.
 * @summary Pixelation Post-Processing Effect
 * @category Effects
 * @group Components
 */
export class PixelationEffect extends PostProcessingEffect {
    get typeName(): string {
        return "PixelationEffect";
    }

    @serializable(VolumeParameter)
    readonly granularity: VolumeParameter = new VolumeParameter(10);

    onCreateEffect(): EffectProviderResult {

        const effect = new MODULES.POSTPROCESSING.MODULE.PixelationEffect();

        this.granularity.onValueChanged = v => {
            effect.granularity = v;
        }

        return effect;
    }

}
registerCustomEffectType("PixelationEffect", PixelationEffect);
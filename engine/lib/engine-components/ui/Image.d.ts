import { Texture } from 'three';
import { MaskableGraphic } from './Graphic.js';
declare class Sprite {
    texture: Texture | null;
    rect?: {
        width: number;
        height: number;
    };
}
/**
 * Image is a UI component that displays a sprite (2D image) in the user interface.
 * You can set the image property to assign a texture to be displayed.
 * The sprite can be customized with various properties such as color tinting and pixel density.
 * @summary Display a 2D image in the UI
 * @category User Interface
 * @group Components
 */
export declare class Image extends MaskableGraphic {
    set image(img: Texture | null);
    get image(): Texture | null;
    get sprite(): Sprite | undefined;
    set sprite(sprite: Sprite | undefined);
    private _sprite?;
    private pixelsPerUnitMultiplier;
    private isBuiltinSprite;
    protected onBeforeCreate(opts: any): void;
    protected onAfterCreated(): void;
}
/**
 * @category User Interface
 * @group Components
 */
export declare class RawImage extends MaskableGraphic {
    get mainTexture(): Texture | undefined;
    set mainTexture(texture: Texture | undefined);
    private _mainTexture?;
    protected onAfterCreated(): void;
}
export {};

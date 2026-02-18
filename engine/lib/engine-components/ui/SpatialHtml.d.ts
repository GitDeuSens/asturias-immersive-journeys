import { Behaviour } from '../Component.js';
/**
 * SpatialHtml is a component that allows you to integrate HTML elements into a 3D scene.
 * By specifying the ID of an existing HTML element, you can render it as a 3D object within the scene.
 * @summary Render HTML elements as 3D objects in the scene
 * @category User Interface
 * @group Components
 */
export declare class SpatialHtml extends Behaviour {
    id: string | null;
    keepAspect: boolean;
    private _object;
    onEnable(): void;
    onDisable(): void;
}

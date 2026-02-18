import { Behaviour } from "./Component.js";
/**
 * Aligns this GameObject between two other GameObjects, scaling it to fit the distance.
 * You can use this to create dynamic beams or connectors between objects.
 *
 * @summary Aligns and scales the object between two target GameObjects
 * @category Constraints
 * @group Components
 **/
export declare class AlignmentConstraint extends Behaviour {
    private from;
    private to;
    private width;
    private centered;
    private _centerPos;
    awake(): void;
    update(): void;
}

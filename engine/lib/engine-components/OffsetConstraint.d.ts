import { Behaviour } from "./Component.js";
/**
 * OffsetConstraint component allows an object to maintain a specified positional and rotational offset
 * relative to another object, with options for alignment and leveling.
 * @summary Maintains positional and rotational offset relative to another object
 * @category Constraints
 * @group Components
 */
export declare class OffsetConstraint extends Behaviour {
    private referenceSpace;
    private from;
    private affectPosition;
    private affectRotation;
    private alignLookDirection;
    private levelLookDirection;
    private levelPosition;
    private positionOffset;
    private rotationOffset;
    private offset;
    update(): void;
}

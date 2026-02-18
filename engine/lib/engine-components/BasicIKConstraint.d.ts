import { Behaviour } from "./Component.js";
/**
 * BasicIKConstraint positions the GameObject between two target GameObjects (`from` and `to`) with an optional `hint` GameObject to guide the bending direction.
 * This is useful for simple inverse kinematics setups, such as positioning a joint in a limb.
 *
 * @summary Simple Inverse Kinematics Constraint
 * @category Animation
 * @group Components
 */
export declare class BasicIKConstraint extends Behaviour {
    private from;
    private to;
    private hint;
    private desiredDistance;
    onEnable(): void;
    update(): void;
}

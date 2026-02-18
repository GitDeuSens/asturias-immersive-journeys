import { Vector3 } from "three";
import { Behaviour } from "./Component.js";
import { Rigidbody } from "./RigidBody.js";
/**
 * Base class for physics joints connecting two rigid bodies.
 * @summary Connect two Rigidbodies
 * @category Physics
 * @group Components
 */
export declare abstract class Joint extends Behaviour {
    connectedBody?: Rigidbody;
    get rigidBody(): Rigidbody | null;
    private _rigidBody;
    onEnable(): void;
    private create;
    protected abstract createJoint(self: Rigidbody, other: Rigidbody): any;
}
/**
 * The FixedJoint groups together 2 rigidbodies, making them stick together in their bound position
 * @summary Connect two Rigidbodies and make them stick together
 * @category Physics
 * @group Components
 */
export declare class FixedJoint extends Joint {
    protected createJoint(self: Rigidbody, other: Rigidbody): void;
}
/**
 * The HingeJoint groups together 2 rigid bodies, constraining them to move like connected by a hinge.
 *
 * You can specify the anchor point and axis of rotation for the hinge.
 * @summary Connect two Rigidbodies with a hinge
 * @category Physics
 * @group Components
 */
export declare class HingeJoint extends Joint {
    anchor?: Vector3;
    axis?: Vector3;
    protected createJoint(self: Rigidbody, other: Rigidbody): void;
}

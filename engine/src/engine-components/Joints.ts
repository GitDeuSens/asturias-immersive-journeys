import { Vector3 } from "three";

import { serializable } from "../engine/engine_serialization.js";
import { Behaviour } from "./Component.js";
import { Rigidbody } from "./RigidBody.js";

/**
 * Base class for physics joints connecting two rigid bodies.
 * @summary Connect two Rigidbodies
 * @category Physics
 * @group Components
 */
export abstract class Joint extends Behaviour {
    @serializable(Rigidbody)
    connectedBody?: Rigidbody;

    get rigidBody(): Rigidbody | null {
        return this._rigidBody;
    }
    private _rigidBody: Rigidbody | null = null;


    onEnable() {
        if (!this._rigidBody) this._rigidBody = this.gameObject.getComponent(Rigidbody);
        if (this.rigidBody && this.connectedBody)
            this.startCoroutine(this.create());
    }

    private *create() {
        yield;
        if (this.rigidBody && this.connectedBody && this.activeAndEnabled) {
            this.createJoint(this.rigidBody, this.connectedBody)
        }
    }

    protected abstract createJoint(self: Rigidbody, other: Rigidbody);
}

/**
 * The FixedJoint groups together 2 rigidbodies, making them stick together in their bound position
 * @summary Connect two Rigidbodies and make them stick together
 * @category Physics
 * @group Components
 */
export class FixedJoint extends Joint {

    protected createJoint(self: Rigidbody, other: Rigidbody) {
        this.context.physics.engine?.addFixedJoint(self, other);
    }
}

/**
 * The HingeJoint groups together 2 rigid bodies, constraining them to move like connected by a hinge.
 * 
 * You can specify the anchor point and axis of rotation for the hinge.
 * @summary Connect two Rigidbodies with a hinge
 * @category Physics
 * @group Components
 */
export class HingeJoint extends Joint {

    @serializable(Vector3)
    anchor?: Vector3;

    @serializable(Vector3)
    axis?: Vector3;

    protected createJoint(self: Rigidbody, other: Rigidbody) {
        if (this.axis && this.anchor)
            this.context.physics.engine?.addHingeJoint(self, other, this.anchor, this.axis);
    }

}
import { Vector3 } from "three";

import * as utils from "./../engine/engine_three_utils.js";
import { Behaviour, GameObject } from "./Component.js";

/**
 * BasicIKConstraint positions the GameObject between two target GameObjects (`from` and `to`) with an optional `hint` GameObject to guide the bending direction.  
 * This is useful for simple inverse kinematics setups, such as positioning a joint in a limb.
 * 
 * @summary Simple Inverse Kinematics Constraint
 * @category Animation
 * @group Components
 */
export class BasicIKConstraint extends Behaviour {

    private from!: GameObject;
    private to!: GameObject;
    private hint!: GameObject;
    private desiredDistance: number = 1;

    onEnable(): void {
        // console.log(this);
    }

    update() {
        if (!this.from || !this.to || !this.hint) return;

        // console.log(this);

        // find center
        const toPos = utils.getWorldPosition(this.to).clone();
        const fromPos = utils.getWorldPosition(this.from).clone();
        const dist = toPos.distanceTo(fromPos);

        const dir0 = toPos.clone();
        dir0.sub(fromPos);
        const center = fromPos.clone();
        center.add(toPos);
        center.multiplyScalar(0.5);
        
        // find direction we should offset in
        const hintDir = utils.getWorldPosition(this.hint).clone();
        hintDir.sub(center);
        
        const offsetDir = new Vector3();
        offsetDir.crossVectors(hintDir, dir0);
        offsetDir.crossVectors(dir0, offsetDir);
        offsetDir.normalize();

        const halfDist = dist * 0.5;
        const stretchDistance = Math.max(this.desiredDistance, halfDist);
        const offsetLength = Math.sqrt(stretchDistance * stretchDistance - halfDist * halfDist);
        
        const resultPos = offsetDir.clone();
        resultPos.multiplyScalar(offsetLength);
        resultPos.add(center);
        utils.setWorldPosition(this.gameObject, resultPos);

        const lookPos = center.clone();
        lookPos.sub(offsetDir);
        this.gameObject.lookAt(lookPos);
    }
}
import { Vector2, Vector3 } from "three";
import { Collision } from "../engine/engine_types.js";
import { Animator } from "./Animator.js";
import { Behaviour } from "./Component.js";
import { Rigidbody } from "./RigidBody.js";
/**
 * CharacterController adds a capsule collider and rigidbody to the object, constrains rotation, and provides movement and grounded state.
 * It is designed for typical character movement in 3D environments.
 * @summary Character Movement Controller
 * @category Character
 * @group Components
 */
export declare class CharacterController extends Behaviour {
    center: Vector3;
    radius: number;
    height: number;
    private _rigidbody;
    get rigidbody(): Rigidbody;
    private _activeGroundCollisions;
    awake(): void;
    onEnable(): void;
    move(vec: Vector3): void;
    onCollisionEnter(col: Collision): void;
    onCollisionExit(col: Collision): void;
    get isGrounded(): boolean;
    private _contactVelocity;
    get contactVelocity(): Vector3;
}
/**
 * CharacterControllerInput handles user input to control a CharacterController.
 * It supports movement, looking around, jumping, and double jumping.
 * You can customize movement speed, rotation speed, and jump forces.
 * It also integrates with an Animator component for character animations.
 * @summary User Input for Character Controller
 * @category Character
 * @group Components
 */
export declare class CharacterControllerInput extends Behaviour {
    controller?: CharacterController;
    movementSpeed: number;
    rotationSpeed: number;
    jumpForce: number;
    doubleJumpForce: number;
    animator?: Animator;
    lookForward: boolean;
    awake(): void;
    update(): void;
    move(move: Vector2): void;
    look(look: Vector2): void;
    jump(): void;
    private lookInput;
    private moveInput;
    private jumpInput;
    onBeforeRender(): void;
    private _currentSpeed;
    private _currentAngularSpeed;
    private _temp;
    private _jumpCount;
    private _currentRotation;
    handleInput(move: Vector2, look: Vector2, jump: boolean): void;
    private _raycastOptions;
}

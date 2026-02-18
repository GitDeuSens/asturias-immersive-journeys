/// <reference types="webxr" />
export declare type SessionInfo = {
    session: XRSession;
    mode: XRSessionMode;
    init: XRSessionInit;
};
/** Create with static `start`- used to start an XR session while waiting for session granted */
export declare class TemporaryXRContext {
    private static _active;
    static get active(): TemporaryXRContext | null;
    private static _requestInFlight;
    static start(mode: XRSessionMode, init: XRSessionInit): Promise<TemporaryXRContext | null>;
    static handoff(): Promise<SessionInfo | null>;
    static stop(): Promise<void>;
    private readonly _session;
    private readonly _mode;
    private readonly _init;
    get isAR(): boolean;
    get isVR(): boolean;
    private readonly _renderer;
    private readonly _camera;
    private readonly _scene;
    private constructor();
    end(): Promise<void>;
    /** returns the session and session info and stops the temporary rendering */
    handoff(): Promise<SessionInfo>;
    private onEnd;
    private _lastTime;
    private _frames;
    private onFrame;
    private readonly _roomFlyObjects;
    private _logoObject;
    private get _logoDistance();
    private get _logoScale();
    private update;
    /** can be used to prepare the user or fade to black */
    private onBeforeHandoff;
    private setupScene;
}

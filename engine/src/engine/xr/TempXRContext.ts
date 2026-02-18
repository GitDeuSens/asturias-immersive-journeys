import { ArrayCamera, AxesHelper, Camera, Color, DirectionalLight, Fog, GridHelper, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Scene, TextureLoader, Vector3, WebGLRenderer } from "three";

import { needleLogoOnlySVG } from "../assets/index.js";
import { isDevEnvironment } from "../debug/index.js";
import { ObjectUtils, PrimitiveType } from "../engine_create_objects.js";
import { hasCommercialLicense } from "../engine_license.js";
import { Mathf } from "../engine_math.js";
import { delay, DeviceUtilities } from "../engine_utils.js";

export declare type SessionInfo = { session: XRSession, mode: XRSessionMode, init: XRSessionInit };

/** Create with static `start`- used to start an XR session while waiting for session granted */
export class TemporaryXRContext {

    private static _active: TemporaryXRContext | null = null;
    static get active() {
        return this._active;
    }

    private static _requestInFlight = false;

    static async start(mode: XRSessionMode, init: XRSessionInit) {
        if (this._active) {
            console.error("Cannot start a new XR session while one is already active");
            return null;
        }
        if (this._requestInFlight) {
            console.error("Cannot start a new XR session while a request is already in flight");
            return null;
        }

        if ('xr' in navigator && navigator.xr) {
            if (!init) {
                console.error("XRSessionInit must be provided");
                return null;
            }
            this._requestInFlight = true;
            const session = await navigator.xr.requestSession(mode, init).catch(err => {
                console.error("Failed to start temporary XR session:", err);
            });
            if (!session) {
                this._requestInFlight = false;
                return null;
            }
            session.addEventListener("end", () => {
                this._active = null;
            });
            if (!this._requestInFlight) {
                session.end();
                return null;
            }
            this._requestInFlight = false;
            this._active = new TemporaryXRContext(mode, init, session);
            return this._active;
        }

        return null;
    }

    static async handoff(): Promise<SessionInfo | null> {
        if (this._active) {
            return this._active.handoff();
        }
        return null;
    }

    static async stop() {
        this._requestInFlight = false;
        if (this._active) {
            await this._active.end();
            await delay(100);
        }
        this._active = null;
    }

    private readonly _session: XRSession | null;
    private readonly _mode: XRSessionMode;
    private readonly _init: XRSessionInit;

    get isAR() {
        return this._mode === "immersive-ar";
    }
    get isVR() {
        return this._mode === "immersive-vr";
    }

    private readonly _renderer: WebGLRenderer;
    private readonly _camera: Camera;
    private readonly _scene: Scene;

    private constructor(mode: XRSessionMode, init: XRSessionInit, session: XRSession) {
        this._mode = mode;
        this._init = init;
        this._session = session;
        this._session.addEventListener("end", this.onEnd);

        this._renderer = new WebGLRenderer({ alpha: true, antialias: true });
        this._renderer.outputColorSpace = 'srgb';
        // Set pixel ratio and size
        this._renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        this._renderer.setSize(window.innerWidth, window.innerHeight, true);
        if (DeviceUtilities.isNeedleAppClip()) {
            window.requestAnimationFrame(() => {
                const dpr = Math.min(2, window.devicePixelRatio);
                const expectedWidth = Math.floor(window.innerWidth * dpr);
                const expectedHeight = Math.floor(window.innerHeight * dpr);
                this._renderer.domElement.width = expectedWidth;
                this._renderer.domElement.height = expectedHeight;
            });
        }

        this._renderer.setAnimationLoop(this.onFrame);
        this._renderer.xr.setSession(session);
        this._renderer.xr.enabled = true;

        this._camera = new PerspectiveCamera();
        this._scene = new Scene();
        this._scene.fog = new Fog(0x444444, 10, 250);
        this._scene.add(this._camera);
        this.setupScene();

    }

    end() {
        if (!this._session) return Promise.resolve();
        return this._session.end();
    }

    /** returns the session and session info and stops the temporary rendering */
    async handoff() {
        if (!this._session) throw new Error("Cannot handoff a session that has already ended");
        const info: SessionInfo = {
            session: this._session,
            mode: this._mode,
            init: this._init
        };
        await this.onBeforeHandoff();
        // calling onEnd here directly because we dont end the session
        this.onEnd();
        // set the session to null because we dont want this class to accidentaly end the session
        //@ts-ignore
        this._session = null;
        return info;
    }

    private onEnd = () => {
        this._session?.removeEventListener("end", this.onEnd);
        this._renderer.setAnimationLoop(null);
        this._renderer.dispose();
        this._scene.clear();
    }

    private _lastTime = 0;
    private _frames = 0;
    private onFrame = (time: DOMHighResTimeStamp, _frame: XRFrame) => {
        const dt = time - this._lastTime;
        this.update(time, dt);
        if (this._camera.parent !== this._scene) {
            this._scene.add(this._camera);
        }
        this._renderer.render(this._scene, this._camera);
        this._lastTime = time;
        this._frames++;
    }


    private readonly _roomFlyObjects: Mesh[] = [];
    private _logoObject: Mesh | null = null;
    private get _logoDistance() {
        return this.isAR ? 0.3 : 5;
    }
    private get _logoScale() {
        return this.isAR ? 0.04 : 1;
    }

    private update(time: number, _deltaTime: number) {

        const speed = time * .0004;
        for (let i = 0; i < this._roomFlyObjects.length; i++) {
            const obj = this._roomFlyObjects[i];
            obj.position.y += Math.sin(speed + i * .5) * 0.005;
            obj.rotateY(.002);
        }

        const logo = this._logoObject;
        const xrCamera = this._renderer.xr.getCamera() as ArrayCamera;
        if (logo) {
            const cameraForward = new Vector3();
            xrCamera.getWorldDirection(cameraForward);
            const targetPosition = xrCamera.position.clone().addScaledVector(cameraForward, this._logoDistance);
            const speed = this.isAR ? 0.005 : 0.00001; // in VR it's nicer to have the logo basically static
            logo.position.lerp(targetPosition, this._frames <= 2 ? 1 : _deltaTime * speed);
            logo.lookAt(this._camera.position);
        }
    }

    /** can be used to prepare the user or fade to black */
    private async onBeforeHandoff() {
        // for(const sphere of this._spheres) {
        //     sphere.removeFromParent();
        //     await delay(10);
        // }

        // const obj = ObjectUtils.createPrimitive(PrimitiveType.Cube);
        // obj.position.z = -3;
        // obj.position.y = .5;
        // this._scene.add(obj); 
        await delay(1000);
        this._scene.clear();
        // await delay(100);
    }


    private setupScene() {
        this._scene.background = new Color(0x000000);

        let logoSrc = needleLogoOnlySVG;
        if (hasCommercialLicense()) {
            const htmlComponent = document.querySelector("needle-engine");
            if (htmlComponent) {
                const licenseLogo = htmlComponent.getAttribute("logo-src");
                if (licenseLogo?.length) {
                    logoSrc = licenseLogo;
                    if (isDevEnvironment()) console.debug("[XR] Using custom loading logo from license:", logoSrc);
                }
            }
        }
        const logo = this._logoObject = new Mesh(new PlaneGeometry(1, 1, 1, 1), new MeshBasicMaterial({ transparent: true, side: 2 }));
        logo.scale.multiplyScalar(this._logoScale * window.devicePixelRatio);
        logo.renderOrder = 1000;
        logo.material.opacity = 0;
        this._scene.add(logo);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        const drawLogo = (loadingFailed: boolean) => {
            if (!ctx) return;
            logo.material.opacity = 1;
            const size = 1024;
            canvas.width = size;
            canvas.height = size;
            ctx.imageSmoothingQuality = "high";

            // ctx.fillStyle = "#33333399";
            // ctx.fillRect(0, 0, canvas.width, canvas.height,);

            const padding = size * .19;
            const aspect = loadingFailed ? 1 : img.width / img.height;
            if (!loadingFailed) {
                const maxHeight = canvas.height - padding * 1.5;
                const imgWidth = maxHeight * aspect;
                const imgX = (canvas.width - imgWidth) / 2;
                ctx.drawImage(img, imgX, 0, imgWidth, maxHeight);
            }
            const fontSize = size * .12;
            const text = "Loading...";
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.isAR ? "white" : "rgba(255,255,255,0.4)";
            ctx.font = `${fontSize}px Arial`;
            ctx.shadowBlur = size * .02;
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            const metrics = ctx.measureText(text);
            ctx.fillText(text, canvas.width / 2 - metrics.width / 2, canvas.height - padding / 4);
            ctx.font = `${fontSize}px Arial`;
            ctx.fillText(text, canvas.width / 2 - metrics.width / 2, canvas.height - padding / 4);

            const texture = new TextureLoader().load(canvas.toDataURL());
            texture.generateMipmaps = true;
            texture.colorSpace = 'srgb';
            texture.anisotropy = 4;
            const canvasAspect = canvas.width / canvas.height;
            logo.scale.x = this._logoScale * canvasAspect * window.devicePixelRatio;
            logo.scale.y = this._logoScale * window.devicePixelRatio;
            logo.material.map = texture;
            logo.material.needsUpdate = true;
        }
        img.onload = () => drawLogo(false);
        img.onerror = e => {
            console.error("Failed to load temporary XR logo:", logoSrc, e);
            img.src = needleLogoOnlySVG;
        };
        img.crossOrigin = "anonymous";
        img.src = logoSrc;

        const light = new DirectionalLight(0xffffff, 1);
        light.position.set(0, 20, 0);
        light.castShadow = false;
        this._scene.add(light);

        const light2 = new DirectionalLight(0xffffff, 1);
        light2.position.set(0, -1, 0);
        light2.castShadow = false;
        this._scene.add(light2);

        const light3 = new PointLight(0xffffff, 1, 100, 1);
        light3.position.set(0, 2, 0);
        light3.castShadow = false;
        light3.distance = 200;
        this._scene.add(light3);

        // if we're in passthrough
        if (this.isAR === false) {
            const range = 50;
            for (let i = 0; i < 100; i++) {
                const material = new MeshStandardMaterial({
                    color: 0x222222,
                    metalness: 1,
                    roughness: .8,
                });

                const type = PrimitiveType.Sphere; //Mathf.random(0, 1) > .5 ? PrimitiveType.Sphere : PrimitiveType.Cube;
                const obj = ObjectUtils.createPrimitive(type, { material });
                obj.position.x = Mathf.random(-range, range);
                obj.position.y = Mathf.random(-2, range);
                obj.position.z = Mathf.random(-range, range);
                // random rotation
                obj.rotation.x = Mathf.random(0, Math.PI * 2);
                obj.rotation.y = Mathf.random(0, Math.PI * 2);
                obj.rotation.z = Mathf.random(0, Math.PI * 2);
                obj.scale.multiplyScalar(.5 + Math.random() * 10);

                const dist = obj.position.distanceTo(this._camera.position) - obj.scale.x;
                if (dist < 10) {
                    obj.position.z += 5;
                    obj.position.multiplyScalar(1 + 1 / dist);
                }

                this._roomFlyObjects.push(obj);
                this._scene.add(obj);
            }
        }
    }
}
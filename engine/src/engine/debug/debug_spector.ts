import type { Context } from "../engine_setup.js";
import { isDevEnvironment } from "./debug.js";

declare global {
    interface Window {
        SPECTOR?: {
            Spector: new () => Spector;
        }
    }
    interface Spector {
        displayUI: () => void;
        setCanvas: (canvas: HTMLCanvasElement) => void;
        spyCanvases: boolean;
        startCaptureOnNextFrame: () => void;
        captureCanvas: (canvas: HTMLCanvasElement) => any;
    }
}


export function initSpectorIfAvailable(_context: Context, canvas: HTMLCanvasElement): void {
    if (typeof window !== undefined && window.SPECTOR) {
        console.log(window.SPECTOR);
        const params = new URLSearchParams(window.location.search);
        if (params.has("spector")) {
            const frame = Number.parseInt(params.get("spector") || "0") || 0;
            console.log("Scheduled Spector capture at frame #" + frame);
            const spector = new window.SPECTOR.Spector();
            spector.spyCanvases = true;
            waitForFrameAndCapture();
            return;

            function waitForFrameAndCapture() {
                if (frame > _context.time.frame) return window.requestAnimationFrame(() => waitForFrameAndCapture());
                const res = spector.captureCanvas(canvas);
                if (res && res instanceof Promise) res.then(() => spector.displayUI());
                else spector.displayUI();
            }
        }
        else if (isDevEnvironment()) {
            console.debug("Spector available: Add '?spector=<frame>' to the URL to enable it and capture a frame.");
        }
    }
}
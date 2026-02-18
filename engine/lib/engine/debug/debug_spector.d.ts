import type { Context } from "../engine_setup.js";
declare global {
    interface Window {
        SPECTOR?: {
            Spector: new () => Spector;
        };
    }
    interface Spector {
        displayUI: () => void;
        setCanvas: (canvas: HTMLCanvasElement) => void;
        spyCanvases: boolean;
        startCaptureOnNextFrame: () => void;
        captureCanvas: (canvas: HTMLCanvasElement) => any;
    }
}
export declare function initSpectorIfAvailable(_context: Context, canvas: HTMLCanvasElement): void;

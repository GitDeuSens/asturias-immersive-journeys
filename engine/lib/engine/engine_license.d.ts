import type { IContext } from "./engine_types.js";
/** @internal */
export declare function hasProLicense(): boolean;
/** @internal */
export declare function hasIndieLicense(): boolean;
/** @internal */
export declare function hasEduLicense(): boolean;
/** @internal */
export declare function hasCommercialLicense(): boolean;
/** @internal */
export declare function onLicenseCheckResultChanged(cb: (result: boolean) => void): void;
export declare namespace Telemetry {
    export function isAllowed(context: IContext | null | undefined): boolean;
    /**
     * Sends a telemetry event
     */
    export function sendEvent(context: IContext | null | undefined, eventName: string, properties?: Record<string, any>): Promise<void | Response>;
    type ErrorData = {
        message?: string;
        stack?: string;
        filename?: string;
        lineno?: number;
        colno?: number;
        timestamp?: number;
    };
    export function sendError(context: IContext, errorName: string, error: ErrorData | ErrorEvent | Error): Promise<void | Response>;
    export {};
}
export declare let runtimeLicenseCheckPromise: Promise<void> | undefined;

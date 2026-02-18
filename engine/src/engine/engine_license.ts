import { dof } from "three/src/nodes/TSL.js";

import { isDevEnvironment } from "./debug/index.js";
import { BUILD_TIME, GENERATOR, PUBLIC_KEY, VERSION } from "./engine_constants.js";
import { ContextEvent, ContextRegistry } from "./engine_context_registry.js";
import { onInitialized } from "./engine_lifecycle_api.js";
import { isLocalNetwork } from "./engine_networking_utils.js";
import { Context } from "./engine_setup.js";
import type { IContext } from "./engine_types.js";
import { getParam } from "./engine_utils.js";
import { InternalAttributeUtils } from "./engine_utils_attributes.js";

const debug = getParam("debuglicense");

const _licenseCheckResultChangedCallbacks: ((result: boolean) => void)[] = [];

// This is modified by a bundler (e.g. vite)
// Do not edit manually
let NEEDLE_ENGINE_LICENSE_TYPE: string = "basic";
if (debug)
    console.log("License Type: " + NEEDLE_ENGINE_LICENSE_TYPE)

/** @internal */
export function hasProLicense() {
    switch (NEEDLE_ENGINE_LICENSE_TYPE) {
        case "pro":
        case "enterprise":
            return true;
    };
    return false;
}

/** @internal */
export function hasIndieLicense() {
    switch (NEEDLE_ENGINE_LICENSE_TYPE) {
        case "indie":
            return true;
    }
    return false;
}

/** @internal */
export function hasEduLicense() {
    switch (NEEDLE_ENGINE_LICENSE_TYPE) {
        case "edu":
            return true;
    }
    return false;
}

/** @internal */
export function hasCommercialLicense() {
    return hasProLicense() || hasIndieLicense() || hasEduLicense();
}


/** @internal */
export function onLicenseCheckResultChanged(cb: (result: boolean) => void) {
    if (hasProLicense() || hasIndieLicense() || hasEduLicense())
        return cb(true);
    _licenseCheckResultChangedCallbacks.push(cb);
}

function invokeLicenseCheckResultChanged(result: boolean) {
    for (const cb of _licenseCheckResultChangedCallbacks) {
        try {
            cb(result);
        }
        catch {
            // ignore
        }
    }
}



// #region Telemetry
export namespace Telemetry {

    window.addEventListener("error", (event: ErrorEvent) => {
        sendError(Context.Current, "unhandled_error", event);
    });
    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
        sendError(Context.Current, "unhandled_promise_rejection", {
            message: event.reason?.message,
            stack: event.reason?.stack,
            timestamp: Date.now(),
        });
    });

    onInitialized((ctx => sendPageViewEvent(ctx)), { once: true });

    function sendPageViewEvent(ctx: IContext): Promise<void> | void {
        if (!isAllowed(ctx)) {
            if (debug) console.debug("Telemetry is disabled via no-telemetry attribute");
            return;
        }
        return doFetch({
            site_id: "dabb8317376f",
            type: "pageview",
            pathname: window.location.pathname,
            hostname: window.location.hostname,
            page_title: document.title,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            querystring: window.location.search,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            event_name: "page_view"
        }).then(res => {
            if (res instanceof Response && res.ok && isLocalNetwork()) {
                const src = ctx.domElement?.getAttribute("src") || "";
                const sessionKey = src + VERSION + GENERATOR + BUILD_TIME + PUBLIC_KEY;
                if (window.sessionStorage.getItem("session_key") !== sessionKey) {
                    window.sessionStorage.setItem("session_key", sessionKey);
                    sendEvent(ctx, "info", {
                        src: ctx.domElement?.getAttribute("src") || "",
                        version: VERSION,
                        generator: GENERATOR,
                        build_time: BUILD_TIME,
                        public_key: PUBLIC_KEY,
                    });
                }
            }
            return;
        })
    }

    export function isAllowed(context: IContext | null | undefined): boolean {
        let domElement = context?.domElement as HTMLElement | null;
        if (!domElement) domElement = document.querySelector<HTMLElement>("needle-engine");
        if (!domElement && !context) return false;

        const attribute = domElement?.getAttribute("no-telemetry");
        if (attribute === "" || attribute === "true" || attribute === "1") {
            if (NEEDLE_ENGINE_LICENSE_TYPE === "pro" || NEEDLE_ENGINE_LICENSE_TYPE === "enterprise") {
                if (debug) console.debug("Telemetry is disabled via no-telemetry attribute");
                return false;
            }
        }
        return true;
    }

    const id = "dabb8317376f";

    /**
     * Sends a telemetry event
     */
    export async function sendEvent(context: IContext | null | undefined, eventName: string, properties?: Record<string, any>) {
        if (!isAllowed(context)) {
            if (debug) console.debug("Telemetry is disabled");
            return;
        }
        const body = {
            site_id: id,
            type: "custom_event",
            pathname: window.location.pathname,
            event_name: eventName,
            properties: properties ? JSON.stringify(properties) : undefined,
        }
        return doFetch(body);
    }

    type ErrorData = {
        message?: string;
        stack?: string;
        filename?: string;
        lineno?: number;
        colno?: number;
        timestamp?: number;
    }

    export async function sendError(context: IContext, errorName: string, error: ErrorData | ErrorEvent | Error) {

        if (!isAllowed(context)) {
            if (debug) console.debug("Telemetry is disabled");
            return;
        }

        if (error instanceof ErrorEvent) {
            error = {
                message: error.message,
                stack: error.error?.stack,
                filename: error.filename,
                lineno: error.lineno,
                colno: error.colno,
                timestamp: error.timeStamp || Date.now(),

            };
        }
        else if (error instanceof Error) {
            error = {
                message: error.message,
                stack: error.stack,
                timestamp: Date.now(),
            };
        }
        const body = {
            site_id: id,
            type: "error",
            event_name: errorName || "error",
            properties: JSON.stringify({
                error_name: errorName,
                message: error.message,
                stack: error.stack,
                filename: error.filename,
                lineno: error.lineno,
                colno: error.colno,
                timestamp: error.timestamp,
            })
        }
        return doFetch(body);
    }

    function doFetch(body: Record<string, any>) {
        try {
            const url = "https://needle.tools/api/v1/rum/t";
            return fetch(url, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                },
                // Ensures request completes even if page unloads
                keepalive: true,
                // Allow CORS requests
                mode: 'cors',
                // Low priority to avoid blocking other requests
                // @ts-ignore
                priority: 'low',
            }).catch(e => {
                if (debug) console.error("Failed to send telemetry", e);
            })
        }
        catch (err) {
            if (debug) console.error(err);
        }
        return Promise.resolve();
    }
}


ContextRegistry.registerCallback(ContextEvent.ContextRegistered, evt => {
    showLicenseInfo(evt.context);
    handleForbidden(evt.context);
    setTimeout(() => sendUsageMessageToAnalyticsBackend(evt.context), 2000);
});

export let runtimeLicenseCheckPromise: Promise<void> | undefined = undefined;
let applicationIsForbidden = false;
let applicationForbiddenText = "";
async function checkLicense() {
    // Only perform the runtime license check once
    if (runtimeLicenseCheckPromise) return runtimeLicenseCheckPromise;
    if (NEEDLE_ENGINE_LICENSE_TYPE === "basic") {
        try {
            const licenseUrl = "https://needle.tools/api/v1/needle-engine/check?location=" + encodeURIComponent(window.location.href) + "&version=" + VERSION + "&generator=" + encodeURIComponent(GENERATOR);
            const res = await fetch(licenseUrl, {
                method: "GET",
            }).catch(_err => {
                if (debug) console.error("License check failed", _err);
                return undefined;
            });
            if (res?.status === 200) {
                applicationIsForbidden = false;
                if (debug) console.log("License check succeeded");
                NEEDLE_ENGINE_LICENSE_TYPE = "pro";
                invokeLicenseCheckResultChanged(true);
            }
            else if (res?.status === 403) {
                invokeLicenseCheckResultChanged(false);
                applicationIsForbidden = true;
                applicationForbiddenText = await res.text();
            }
            else {
                invokeLicenseCheckResultChanged(false);
                if (debug) console.log("License check failed with status " + res?.status);
            }
        }
        catch (err) {
            invokeLicenseCheckResultChanged(false);
            if (debug) console.error("License check failed", err);
        }
    }
    else if (debug) console.log("Runtime license check is skipped because license is already applied as \"" + NEEDLE_ENGINE_LICENSE_TYPE + "\"");
}
runtimeLicenseCheckPromise = checkLicense();

async function handleForbidden(ctx: IContext) {
    function createForbiddenElement() {
        const div = document.createElement("div");
        div.className = "needle-forbidden";
        div.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: all;
        zIndex: 2147483647;
        line-height: 1.5;
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        `;
        const expectedStyle = div.style.cssText;

        const text = document.createElement("div");
        div.appendChild(text);
        text.style.cssText = `
        position: absolute;
        left: 0;
        right: 0;
        top:0;
        bottom: 0;
        padding: 10%;
        color: white;
        font-size: 20px;
        font-family: sans-serif;
        text-align: center;
        pointer-events: all;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0,0,0,.3);
        text-shadow: 0 0 2px black;
        `;
        const expectedTextStyle = text.style.cssText;
        const forbiddenText = applicationForbiddenText?.length > 1 ? applicationForbiddenText : "This web application has been paused.<br/>You might be in violation of the Needle Engine terms of use.<br/>Please contact the Needle support if you think this is a mistake.";
        text.innerHTML = forbiddenText;
        setInterval(() => {
            if (text.innerHTML !== forbiddenText) text.innerHTML = forbiddenText;
            if (text.parentNode !== div) div.appendChild(text);
            if (div.style.cssText !== expectedStyle) div.style.cssText = expectedStyle;
            if (text.style.cssText !== expectedTextStyle) text.style.cssText = expectedTextStyle;
        }, 500)
        return div;
    }
    let forbiddenElement = createForbiddenElement();
    const expectedCSS = forbiddenElement.style.cssText;
    setInterval(() => {
        if (applicationIsForbidden === true) {
            if (forbiddenElement.style.cssText !== expectedCSS) forbiddenElement = createForbiddenElement();
            if (ctx.domElement.shadowRoot) {
                if (forbiddenElement.parentNode !== ctx.domElement.shadowRoot)
                    ctx.domElement.shadowRoot?.appendChild(forbiddenElement);
            }
            else if (forbiddenElement.parentNode != document.body) {
                document.body.appendChild(forbiddenElement);
            }
        }
    }, 500)
}

async function showLicenseInfo(ctx: IContext) {
    try {
        if (!hasProLicense() && !hasIndieLicense()) {
            return onNonCommercialVersionDetected(ctx);
        }
    }
    catch (err) {
        if (debug) console.log("License check failed", err)
        return onNonCommercialVersionDetected(ctx)
    }
    if (debug) onNonCommercialVersionDetected(ctx)
}



async function onNonCommercialVersionDetected(ctx: IContext) {

    // if the engine loads faster than the license check, we need to capture the ready event here
    let isReady = false;
    ctx.domElement.addEventListener("ready", () => isReady = true);

    await runtimeLicenseCheckPromise?.catch(() => { });


    if (hasProLicense() || hasIndieLicense()) return;
    if (hasCommercialLicense() === false) logNonCommercialUse();

    // check if the engine is already ready (meaning has finished loading)
    if (isReady) {
        insertNonCommercialUseHint(ctx);
    }
    else {
        ctx.domElement.addEventListener("ready", () => {
            insertNonCommercialUseHint(ctx);
        });
    }
}

// const licenseElementIdentifier = "needle-license-element";
// const licenseDuration = 10000;
// const licenseDelay = 1200;
function insertNonCommercialUseHint(ctx: IContext) {

    const style = `
        position: relative;
        display: block;
        background-size: 20px;
        background-position: 10px 5px;
        background-repeat:no-repeat;
        background-image:url('${base64Logo}');
        background-max-size: 40px;
        padding: 10px;
        padding-left: 30px;
    `;
    if (NEEDLE_ENGINE_LICENSE_TYPE === "edu") {
        console.log("%c " + "This project is supported by Needle for Education – https://needle.tools", style);
    }
    else {
        // if the user has a basic license we already show the logo in the menu and log a license message
        return;
    }

    const banner = document.createElement("div");
    banner.className = "needle-non-commercial-use";
    banner.innerHTML = "Made with Needle for Education";
    ctx.domElement.shadowRoot?.appendChild(banner);
    let bannerStyle = `
        position: absolute;
        font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
        font-size: 12px;
        color: rgb(100, 100, 100);
        /*mix-blend-mode: difference;*/
        background-color: transparent;
        z-index: 10000;

        cursor: pointer;
        user-select: none;
        opacity: 0;

        bottom: 6px;
        right: 12px;
        transform: translateY(0px);
        transition: all .5s ease-in-out 1s;
    `;
    banner.style.cssText = bannerStyle;
    banner.addEventListener("click", () => { window.open("https://needle.tools", "_blank") });
    let expectedBannerStyle = banner.style.cssText;
    setTimeout(() => {
        bannerStyle = bannerStyle.replace("opacity: 0", "opacity: 1");
        bannerStyle = bannerStyle.replace("transform: translateY(10px)", "transform: translateY(0)");
        banner.style.cssText = bannerStyle;
        expectedBannerStyle = banner.style.cssText;
    }, 100);

    // ensure the banner is always visible
    const interval = setInterval(() => {
        const parent = ctx.domElement.shadowRoot || ctx.domElement;
        if (banner.parentNode !== parent) {
            parent.appendChild(banner);
        }
        if (expectedBannerStyle != banner.style.cssText) {
            banner.style.cssText = bannerStyle;
            expectedBannerStyle = banner.style.cssText;
        }
    }, 1000);

    if (hasEduLicense()) {
        const removeDelay = 20_000;
        setTimeout(() => {
            clearInterval(interval);
            banner?.remove();
            // show the logo every x minutes
            const intervalInMinutes = 5;
            setTimeout(() => {
                if (ctx.domElement.parentNode)
                    insertNonCommercialUseHint(ctx);
            }, 1000 * 60 * intervalInMinutes)
        }, removeDelay);
    }

}


const base64Logo = "data:image/webp;base64,UklGRrABAABXRUJQVlA4WAoAAAAQAAAAHwAAHwAAQUxQSKEAAAARN6CmbSM4WR7vdARON11EBDq3fLiNbVtVzpMCPlKAEzsx0Y/x+Ovuv4dn0EFE/ydAvz6YggXzgh5sVgXM/zOC/4sii7qgGvB5N7hmuQYwkvazWAu1JPW41FXSHq6pnaQWvqYH18Fc0j1hO/BFTtIeSBlJi5w6qIIO7IOrwhFsB2Yxukif0FTRLpXswHR8MxbslKe9VZsn/Ub5C7YFOpqSTABWUDgg6AAAAFAGAJ0BKiAAIAA+7VyoTqmkpCI3+qgBMB2JbACdMt69DwMIQBLhkTO6XwY00UEDK6cNIDnuNibPf0EgAP7Y1myuiQHLDsF/0h5unrGh6WAbv7aegg2ZMd3uRKfT/3SJztcaujYfTvMXspfCTmYcoO6a+vhC3ss4M8uM58t4siiu59I4aOl59e9Sr6xoxYlHf2v+NnBNpJYeJf8jABQAId/PXuBkLEFkiCucgSGEcfhvajql/j3reCGl0M5/9gQWy7ayNPs+wlvIxFnNfSlfuND4CZOCyxOHhRqOmHN4ULHo3tCSrUNvgAA=";

let lastLogTime = 0;
async function logNonCommercialUse(_logo?: string) {
    const now = Date.now();
    if (now - lastLogTime < 2000) return;
    lastLogTime = now;
    const style = `
        position: relative;
        display: block;
        font-size: 18px;
        background-size: 20px;
        background-position: 10px 5px;
        background-repeat:no-repeat;
        background-image:url('${base64Logo}');
        background-max-size: 40px;
        margin-bottom: 5px;
        margin-top: .3em;
        margin-bottom: .5em;
        padding: .2em;
        padding-left: 25px;
        border-radius: .5em;
        border: 2px solid rgba(160,160,160,.3);
    `;
    // url must contain https for firefox to make it clickable
    const version = VERSION;
    const licenseText = `Needle Engine — No license active, commercial use is not allowed. Visit https://needle.tools/pricing for more information and licensing options! v${version}`;
    if (Context.Current?.xr) {
        console.log(licenseText);
    }
    else {
        console.log("%c " + licenseText, style);
    }
}


async function sendUsageMessageToAnalyticsBackend(context: IContext) {
    // We can't send beacons from cross-origin isolated pages
    if (window.crossOriginIsolated) return;

    if (!Telemetry.isAllowed(context)) {
        if (debug) console.debug("Telemetry is disabled via no-telemetry attribute");
        return;
    }

    try {
        const analyticsUrl = "htt" + "ps://" + "needle" + ".tools/" + "api/v1/needle-engine/ping";
        if (analyticsUrl) {

            // current url without query parameters
            const currentUrl = window.location.href.split("?")[0];
            const license = NEEDLE_ENGINE_LICENSE_TYPE;

            const beaconData = {
                license,
                url: currentUrl,
                hostname: window.location.hostname,
                pathname: window.location.pathname,
                // search: window.location.search,
                // hash: window.location.hash,
                version: VERSION,
                generator: GENERATOR,
                build_time: BUILD_TIME,
                public_key: PUBLIC_KEY,
            };
            const res = navigator.sendBeacon?.(analyticsUrl, JSON.stringify(beaconData));
            if (debug) console.debug("Sent beacon: " + res);
        }
    }
    catch (err) {
        if (debug)
            console.log("Failed to send non-commercial usage message to analytics backend", err);
    }
}

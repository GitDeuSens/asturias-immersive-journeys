import { DeviceUtilities, getParam } from "../engine_utils.js";
import { getErrorCount } from "./debug_overlay.js";
let consoleInstance = undefined;
let consoleHtmlElement = null;
let consoleSwitchButton = null;
let isLoading = false;
let isVisible = false;
let watchInterval = null;
const defaultButtonIcon = "terminal";
const showConsole = getParam("console");
if (showConsole) {
    showDebugConsole();
}
const $defaultConsoleParent = Symbol("consoleParent");
export function showDebugConsole() {
    if (consoleInstance) {
        isVisible = true;
        consoleInstance.showSwitch();
        return;
    }
    createConsole();
}
export function hideDebugConsole() {
    if (!consoleInstance)
        return;
    isVisible = false;
    consoleInstance.hide();
    consoleInstance.hideSwitch();
}
function beginWatchingLogs() {
    if (watchInterval)
        return;
    watchInterval = setInterval(consoleElementUpdateInterval, 500);
}
let lastErrorCount = 0;
function consoleElementUpdateInterval() {
    const currentCount = getErrorCount();
    const receivedNewErrors = currentCount !== lastErrorCount;
    lastErrorCount = currentCount;
    if (receivedNewErrors) {
        onNewConsoleErrors();
    }
}
function onNewConsoleErrors() {
    showDebugConsole();
    if (consoleSwitchButton) {
        consoleSwitchButton.setAttribute("error", "true");
        consoleSwitchButton.innerText = "🤬";
    }
}
function onConsoleSwitchButtonClicked() {
    if (consoleSwitchButton) {
        consoleSwitchButton.removeAttribute("error");
        consoleSwitchButton.innerText = defaultButtonIcon;
    }
}
function onResetConsoleElementToDefaultParent() {
    if (consoleHtmlElement && consoleHtmlElement[$defaultConsoleParent]) {
        consoleHtmlElement[$defaultConsoleParent].appendChild(consoleHtmlElement);
    }
}
function createConsole(startHidden = false) {
    if (consoleInstance !== undefined)
        return;
    if (isLoading)
        return;
    isLoading = true;
    const script = document.createElement("script");
    script.onload = () => {
        // check if VConsole is now defined on globalThis
        if (!globalThis.VConsole) {
            console.warn("🌵 Debug console failed to load.");
            isLoading = false;
            consoleInstance = null;
            return;
        }
        isLoading = false;
        isVisible = true;
        beginWatchingLogs();
        consoleInstance = new VConsole({
            // defaultPlugins: ['system', 'network'],
            pluginOrder: ['default', 'needle-console'],
        });
        const files = globalThis["needle:codegen_files"];
        if (files && files.length > 0) {
            consoleInstance.addPlugin(createInspectPlugin());
        }
        // Add plugin for device utilities
        consoleInstance.addPlugin(createDeviceUtilitiesPlugin());
        // Add plugin for graphics info
        consoleInstance.addPlugin(createGraphicsInfoPlugin());
        consoleHtmlElement = getConsoleElement();
        if (consoleHtmlElement) {
            consoleHtmlElement[$defaultConsoleParent] = consoleHtmlElement.parentElement;
            consoleHtmlElement.style.position = "absolute";
            consoleHtmlElement.style.zIndex = Number.MAX_SAFE_INTEGER.toString();
            // const styleSheetList = document.styleSheets;
            // for (let i = 0; i < styleSheetList.length; i++) {
            //     const styleSheet = styleSheetList[i];
            //     const firstRule = styleSheet.cssRules[0] as CSSStyleRule;
            //     if(firstRule && firstRule.selectorText === "#__vconsole") {
            //         console.log("found vconsole style sheet");
            //         const styleTag = document.createElement("style");
            //         styleTag.innerHTML = "#__needleconsole {}";
            //         for (let j = 0; j < styleSheet.cssRules.length; j++) {
            //             const rule = styleSheet.cssRules[j] as CSSStyleRule;
            //             styleTag.innerHTML += rule.cssText;
            //         }
            //         consoleHtmlElement.appendChild(styleTag);
            //     }
            // }
        }
        consoleInstance.setSwitchPosition(20, 30);
        consoleSwitchButton = getConsoleSwitchButton();
        if (consoleSwitchButton) {
            consoleSwitchButton.innerText = defaultButtonIcon;
            consoleSwitchButton.addEventListener("click", onConsoleSwitchButtonClicked);
            const styles = document.createElement("style");
            const size = 40;
            styles.innerHTML = `
                #__vconsole .vc-switch {
                    border: 1px solid rgba(255, 255, 255, .1);
                    border-radius: 50%;
                    width: ${size}px;
                    height: ${size}px;
                    padding: 0;
                    line-height: ${size}px;
                    font-size: ${size * .4}px;
                    text-align: center;
                    background: #ffffff5c;
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    user-select: none;
                    pointer-events: auto;
                    transition: transform .2s ease-in-out;
                    box-shadow: 0px 7px 0.5rem 0px rgb(0 0 0 / 6%), inset 0px 0px 1.3rem rgba(0,0,0,.05);

                    font-family: 'Material Symbols Outlined';
                    color: black;
                    font-size: 2.3em;
                    font-weight: 100;
                }
                #__vconsole .vc-switch:hover {
                    cursor: pointer;
                    transform: scale(1.1);
                    transition: transform .1s ease-in-out, background .1s linear;
                    background: rgba(245, 245, 245, .8);
                    outline: rgba(0, 0, 0, .05) 1px solid;
                }
                #__vconsole .vc-switch[error] {
                    background: rgba(255,0,0,.2);
                    animation: vconsole-notify 1s ease-in-out;
                    line-height: 35px;
                }
                @keyframes vconsole-notify {
                    from {
                        transform: scale(1, 1);
                    }
                    10% {
                        transform: scale(1.3, 1.3);
                    }
                    70% {
                        transform: scale(1.4, 1.4);
                    }
                    to {
                        transform: scale(1, 1);
                    }
                }
                #__vconsole .vc-panel {
                    font-family: monospace;
                    font-size: 11px;
                }
                #__vconsole .vc-plugin-box.vc-actived {
                    height: 100%;
                }
                #__vconsole .vc-mask {
                    overflow: hidden;
                }
            `;
            consoleHtmlElement?.prepend(styles);
            if (startHidden === true && getErrorCount() <= 0)
                hideDebugConsole();
            console.log("🌵 Debug console has loaded");
        }
    };
    script.onerror = () => {
        console.warn("🌵 Debug console failed to load." + (window.crossOriginIsolated ? "This page is using cross-origin isolation, so external scripts can't be loaded." : ""));
        isLoading = false;
        consoleInstance = null;
    };
    script.src = "https://cdn.jsdelivr.net/npm/vconsole@3.15.1/dist/vconsole.min.js";
    document.body.appendChild(script);
}
function createInspectPlugin() {
    if (!globalThis.VConsole)
        return;
    const plugin = new VConsole.VConsolePlugin("needle-console", "🌵 Inspect glTF");
    const getIframe = () => {
        return document.querySelector("#__vc_plug_" + plugin._id + " iframe");
    };
    plugin.on('renderTab', function (callback) {
        const files = globalThis["needle:codegen_files"];
        if (!files || files.length === 0)
            return;
        let query = globalThis["needle:codegen_files"][0];
        const index = query.indexOf("?");
        if (index > -1)
            query = query.substring(0, index);
        const currentAbsolutePath = location.protocol + '//' + location.host + location.pathname;
        const currentPath = currentAbsolutePath + "/" + query;
        const urlEncoded = encodeURIComponent(currentPath);
        plugin.fullUrl = "https://viewer.needle.tools?inspect&file=" + urlEncoded;
        var html = `<iframe src="" style="width: 100%; height: 99%; border: none;"></iframe>`;
        callback(html);
    });
    plugin.on('show', function () {
        const elem = getIframe();
        if (elem && elem.src !== plugin.fullUrl)
            elem.src = plugin.fullUrl;
    });
    plugin.on('hide', function () {
        const elem = getIframe();
        if (elem)
            elem.src = "";
    });
    /* bottom tool bar
    plugin.on('addTool', function(callback) {
        var button = {
            name: 'Reload',
            onClick: function(event) {
                location.reload();
            }
        };
        callback([button]);
    });
    */
    plugin.on('addTopBar', function (callback) {
        var btnList = new Array();
        btnList.push({
            name: 'Open in new window ↗',
            onClick: function (_event) {
                window.open(plugin.fullUrl, '_blank');
                consoleInstance?.hide();
            }
        });
        btnList.push({
            name: 'Reload',
            onClick: function (_event) {
                const iframe = getIframe();
                if (iframe)
                    iframe.src = plugin.fullUrl;
            }
        });
        btnList.push({
            name: 'Fullscreen',
            onClick: function (_event) {
                const iframe = getIframe();
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                }
                else if (iframe["webkitRequestFullscreen"] instanceof Function) {
                    iframe["webkitRequestFullscreen"]();
                }
            }
        });
        callback(btnList);
    });
    return plugin;
}
const CONTAINER_STYLE = "padding: 10px; font-family: monospace;";
const HEADING_STYLE = "margin-bottom: 10px;";
const SUBHEADING_STYLE = "margin-bottom: 10px; margin-top: 15px;";
const TABLE_STYLE = "width: 100%; border-collapse: collapse; border: 1px solid rgba(0,0,0,0.1); table-layout: fixed;";
const CELL_STYLE = "border: 1px solid rgba(0,0,0,0.1); padding: 5px;";
const HEADER_CELL_STYLE = CELL_STYLE;
const VALUE_CELL_STYLE = CELL_STYLE + " word-break: break-all;";
function createTable(rows, sortByValue = false) {
    if (sortByValue) {
        rows.sort((a, b) => (b.value ? 1 : 0) - (a.value ? 1 : 0));
    }
    let html = `<table style='${TABLE_STYLE}'>`;
    html += "<tbody>";
    for (const row of rows) {
        const value = typeof row.value === 'boolean' ? (row.value ? "✅" : "❌") : row.value;
        html += `<tr><td style='${HEADER_CELL_STYLE}'>${row.label}</td><td style='${VALUE_CELL_STYLE}'>${value}</td></tr>`;
    }
    html += "</tbody></table>";
    return html;
}
function getWebGL2Support() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');
        if (gl) {
            return "✅";
        }
    }
    catch (e) {
        // WebGL2 not supported
    }
    return "❌";
}
function createDeviceUtilitiesPlugin() {
    if (!globalThis.VConsole)
        return;
    const plugin = new VConsole.VConsolePlugin("device-utilities", "📱 Device Info");
    plugin.on('renderTab', function (callback) {
        let html = `<div style='${CONTAINER_STYLE}'>`;
        // Device type
        const deviceType = getDeviceType();
        html += `<h3 style='${HEADING_STYLE}'>Device: ${deviceType}</h3>`;
        // Device capabilities table
        html += createTable([
            { label: "💻 Desktop", value: DeviceUtilities.isDesktop() },
            { label: "📱 Mobile Device", value: DeviceUtilities.isMobileDevice() },
            { label: "🍎 iOS", value: DeviceUtilities.isiOS() },
            { label: "📱 iPad", value: DeviceUtilities.isiPad() },
            { label: "🤖 Android", value: DeviceUtilities.isAndroidDevice() },
            { label: "🦊 Mozilla XR", value: DeviceUtilities.isMozillaXR() },
            { label: "🌵 Needle App Clip", value: DeviceUtilities.isNeedleAppClip() },
            { label: "🍏 macOS", value: DeviceUtilities.isMacOS() },
            { label: "👓 VisionOS", value: DeviceUtilities.isVisionOS() },
            { label: "🧭 Safari", value: DeviceUtilities.isSafari() },
            { label: "🕶️ Meta Quest", value: DeviceUtilities.isQuest() },
            { label: "🔗 QuickLook AR Support", value: DeviceUtilities.supportsQuickLookAR() },
        ], true);
        // Versions
        const versionRows = [];
        const iosVersion = DeviceUtilities.getiOSVersion();
        if (iosVersion)
            versionRows.push({ label: "🍎 iOS Version", value: iosVersion });
        const chromeVersion = DeviceUtilities.getChromeVersion();
        if (chromeVersion)
            versionRows.push({ label: "🌐 Chrome Version", value: chromeVersion });
        const safariVersion = DeviceUtilities.getSafariVersion();
        if (safariVersion)
            versionRows.push({ label: "🧭 Safari Version", value: safariVersion });
        if (versionRows.length > 0) {
            html += createTable(versionRows, false);
        }
        html += "</div>";
        // User Agent table
        html += `<div style='${CONTAINER_STYLE} margin-top: 20px;'>`;
        html += `<h3 style='${HEADING_STYLE}'>User Agent Info</h3>`;
        const userAgentRows = [
            { label: "User Agent", value: navigator.userAgent },
            { label: "Platform", value: navigator.platform },
            { label: "App Version", value: navigator.appVersion },
            // @ts-ignore
            { label: "User Agent Data", value: navigator.userAgentData ? `Platform: ${navigator.userAgentData.platform}, Mobile: ${navigator.userAgentData.mobile}` : "Not supported" },
            { label: "WebXR", value: 'xr' in navigator ? "✅" : "❌" },
            { label: "WebGPU", value: 'gpu' in navigator ? "✅" : "❌" },
            { label: "WebGL 2", value: getWebGL2Support() },
        ];
        html += createTable(userAgentRows, false);
        html += "</div>";
        callback(html);
    });
    return plugin;
}
function createGraphicsInfoPlugin() {
    if (!globalThis.VConsole)
        return;
    const plugin = new VConsole.VConsolePlugin("graphics-info", "🎨 Graphics Info");
    plugin.on('renderTab', async function (callback) {
        let html = `<div style='${CONTAINER_STYLE}'>`;
        // General GPU Info Table
        const generalInfo = getGeneralGPUInfo();
        if (generalInfo.length > 0) {
            html += `<h3 style='${SUBHEADING_STYLE}'>General GPU Info</h3>`;
            html += createTable(generalInfo, false);
        }
        // WebGL Info Table
        const webglInfo = getWebGLDetailedInfo();
        if (webglInfo.length > 0) {
            html += `<h3 style='${SUBHEADING_STYLE}'>WebGL</h3>`;
            html += createTable(webglInfo, false);
        }
        // WebGL 2 Features Table
        const webgl2Features = getWebGL2FeaturesTable();
        if (webgl2Features.length > 0) {
            html += `<h3 style='${SUBHEADING_STYLE}'>WebGL 2 Features</h3>`;
            html += createTable(webgl2Features, false);
        }
        // WebGL Limits Table
        const webglLimits = getWebGLLimitsTable();
        if (webglLimits.length > 0) {
            html += `<h3 style='${SUBHEADING_STYLE}'>WebGL Limits</h3>`;
            html += createTable(webglLimits, false);
        }
        // Texture Formats Table
        const textureFormats = getTextureFormatsTable();
        if (textureFormats.length > 0) {
            html += `<h3 style='${SUBHEADING_STYLE}'>Texture Formats</h3>`;
            html += createTable(textureFormats, false);
        }
        // WebGPU Info Table
        const webgpuInfo = await getWebGPUInfoTable();
        if (webgpuInfo.length > 0) {
            html += `<h3 style='${SUBHEADING_STYLE}'>WebGPU</h3>`;
            html += createTable(webgpuInfo, false);
        }
        // Safari specific GPU info
        if (DeviceUtilities.isSafari()) {
            const safariGPUInfo = getSafariGPUInfo();
            if (safariGPUInfo.length > 0) {
                html += `<h3 style='${SUBHEADING_STYLE}'>Safari GPU Info</h3>`;
                html += createTable(safariGPUInfo, false);
            }
        }
        html += "</div>";
        callback(html);
    });
    return plugin;
}
function getGeneralGPUInfo() {
    const info = [];
    // Display and window info
    const dpr = window.devicePixelRatio;
    info.push({ label: "Device Pixel Ratio", value: dpr.toString() });
    info.push({ label: "Width (px)", value: (window.innerWidth * dpr).toString() });
    info.push({ label: "Height (px)", value: (window.innerHeight * dpr).toString() });
    // Estimated physical screen size in cm (96 DPI desktop, 150 DPI mobile)
    const isMobile = DeviceUtilities.isMobileDevice();
    const estimatedDPI = isMobile ? 150 : 96;
    const widthInches = screen.width / estimatedDPI;
    const heightInches = screen.height / estimatedDPI;
    const widthCm = widthInches * 2.54;
    const heightCm = heightInches * 2.54;
    info.push({ label: "Estimated Width (cm)", value: widthCm.toFixed(1) });
    info.push({ label: "Estimated Height (cm)", value: heightCm.toFixed(1) });
    const webglInfo = getWebGLInfo();
    if (webglInfo) {
        info.push({ label: "GPU", value: webglInfo.renderer });
        info.push({ label: "Driver", value: webglInfo.vendor });
        info.push({ label: "ANGLE", value: webglInfo.angle || "Not detected" });
        // Enhanced GPU parsing
        const gpuDetails = parseGPUDetails(webglInfo.renderer);
        if (gpuDetails) {
            if (gpuDetails.manufacturer)
                info.push({ label: "Manufacturer", value: gpuDetails.manufacturer });
            if (gpuDetails.cardVersion)
                info.push({ label: "Card Version", value: gpuDetails.cardVersion });
            if (gpuDetails.brand)
                info.push({ label: "Brand", value: gpuDetails.brand });
            info.push({ label: "Integrated", value: gpuDetails.integrated ? "Yes" : "No" });
            if (gpuDetails.layer)
                info.push({ label: "WebGL Layer", value: gpuDetails.layer });
        }
    }
    return info;
}
function parseGPUDetails(renderer) {
    if (!renderer)
        return null;
    const extractValue = (reg, str) => {
        const matches = str.match(reg);
        return matches && matches[0];
    };
    const layer = extractValue(/(ANGLE)/g, renderer) || undefined;
    const card = extractValue(/((NVIDIA|AMD|Intel)[^\d]*[^\s]+)/, renderer) || renderer;
    const tokens = card.split(' ');
    tokens.shift();
    const manufacturer = extractValue(/(NVIDIA|AMD|Intel)/g, card) || undefined;
    const cardVersion = tokens.length > 0 ? tokens.pop() : undefined;
    const brand = tokens.length > 0 ? tokens.join(' ') : undefined;
    const integrated = manufacturer === 'Intel';
    return {
        manufacturer,
        cardVersion,
        brand,
        integrated,
        layer,
        card
    };
}
function getWebGLDetailedInfo() {
    const info = [];
    const webglInfo = getWebGLInfo();
    if (webglInfo) {
        info.push({ label: "📊 WebGL Version", value: webglInfo.version });
        info.push({ label: "🎮 WebGL 2 Available", value: getWebGL2Support() });
    }
    return info;
}
function getWebGL2FeaturesTable() {
    const features = [];
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');
        if (!gl)
            return features;
        // Check for important WebGL 2 features
        features.push({ label: "Float Color Buffer", value: gl.getExtension('EXT_color_buffer_float') ? "✅" : "❌" });
        features.push({ label: "Anisotropic Filtering", value: gl.getExtension('EXT_texture_filter_anisotropic') ? "✅" : "❌" });
        features.push({ label: "Float Texture Linear", value: gl.getExtension('OES_texture_float_linear') ? "✅" : "❌" });
        features.push({ label: "S3TC Compression", value: gl.getExtension('WEBGL_compressed_texture_s3tc') ? "✅" : "❌" });
        features.push({ label: "ETC Compression", value: gl.getExtension('WEBGL_compressed_texture_etc') ? "✅" : "❌" });
        features.push({ label: "PVRTC Compression", value: gl.getExtension('WEBGL_compressed_texture_pvrtc') ? "✅" : "❌" });
        features.push({ label: "ASTC Compression", value: gl.getExtension('WEBGL_compressed_texture_astc') ? "✅" : "❌" });
    }
    catch (e) {
        // WebGL2 not supported
    }
    return features;
}
function getWebGLLimitsTable() {
    const limits = [];
    try {
        // Try WebGL 2 first, fall back to WebGL 1
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl)
            return limits;
        const isWebGL2 = gl instanceof WebGL2RenderingContext;
        limits.push({ label: "📏 Max Texture Size", value: gl.getParameter(gl.MAX_TEXTURE_SIZE).toString() });
        limits.push({ label: "🎨 Max Renderbuffer Size", value: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE).toString() });
        limits.push({ label: "🔗 Max Vertex Attribs", value: gl.getParameter(gl.MAX_VERTEX_ATTRIBS).toString() });
        limits.push({ label: "🎯 Max Texture Units", value: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS).toString() });
        if (isWebGL2) {
            limits.push({ label: "⚡ Max Samples", value: gl.getParameter(gl.MAX_SAMPLES).toString() });
            limits.push({ label: "🔄 Max Uniform Buffer Bindings", value: gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS).toString() });
            limits.push({ label: "📐 Max 3D Texture Size", value: gl.getParameter(gl.MAX_3D_TEXTURE_SIZE).toString() });
        }
    }
    catch (e) {
        // WebGL not available
    }
    return limits;
}
function getTextureFormatsTable() {
    const formats = [];
    try {
        // WebGL 1 texture formats
        const canvas1 = document.createElement('canvas');
        const gl1 = canvas1.getContext('webgl');
        if (gl1) {
            formats.push({ label: "WebGL 1 RGBA", value: "✅" });
            formats.push({ label: "WebGL 1 RGB", value: "✅" });
        }
        // WebGL 2 texture formats
        const canvas2 = document.createElement('canvas');
        const gl2 = canvas2.getContext('webgl2');
        if (gl2) {
            formats.push({ label: "WebGL 2 RGBA32F", value: gl2.getExtension('EXT_color_buffer_float') ? "✅" : "❌" });
            formats.push({ label: "WebGL 2 RGB32F", value: gl2.getExtension('EXT_color_buffer_float') ? "✅" : "❌" });
            formats.push({ label: "WebGL 2 R11F_G11F_B10F", value: "✅" });
            formats.push({ label: "WebGL 2 RGB565", value: "✅" });
            formats.push({ label: "WebGL 2 RGB5_A1", value: "✅" });
            formats.push({ label: "WebGL 2 RGBA4444", value: "✅" });
        }
    }
    catch (e) {
        // WebGL not available
    }
    return formats;
}
async function getWebGPUInfoTable() {
    const info = [];
    if (!('gpu' in navigator)) {
        info.push({ label: "🚀 WebGPU Support", value: "❌ Not supported" });
        return info;
    }
    info.push({ label: "🚀 WebGPU Support", value: "✅ Supported" });
    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            info.push({ label: "🎯 Adapter", value: "No adapter available" });
            return info;
        }
        info.push({ label: "🎯 Adapter", value: adapter.name || "Unknown Adapter" });
        const device = await adapter.requestDevice();
        info.push({ label: "🔧 Device", value: device.label || "WebGPU Device" });
        // WebGPU Limits
        info.push({ label: "📏 Max Texture 2D", value: device.limits.maxTextureDimension2D.toString() });
        info.push({ label: "📐 Max Texture 3D", value: device.limits.maxTextureDimension3D.toString() });
        info.push({ label: "📊 Max Texture Array Layers", value: device.limits.maxTextureArrayLayers.toString() });
        info.push({ label: "💾 Max Buffer Size", value: `${(device.limits.maxBufferSize / 1024 / 1024).toFixed(1)}MB` });
        info.push({ label: "🔗 Max Bind Groups", value: device.limits.maxBindGroups.toString() });
    }
    catch (e) {
        info.push({ label: "❌ Error", value: e.message });
    }
    return info;
}
function getWebGLInfo() {
    try {
        const canvas = document.createElement('canvas');
        // Try WebGL 2 first, fall back to WebGL 1
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl)
            return null;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
        const version = gl.getParameter(gl.VERSION);
        // Try to detect ANGLE
        let angle = undefined;
        if (renderer && renderer.includes('ANGLE')) {
            const angleMatch = renderer.match(/ANGLE \(([^)]+)\)/);
            if (angleMatch) {
                angle = angleMatch[1];
            }
        }
        return { renderer, vendor, version, angle };
    }
    catch (e) {
        return null;
    }
}
function getSafariGPUInfo() {
    const info = [];
    // Try to get Safari-specific GPU info
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                if (renderer && renderer.includes('Apple')) {
                    info.push({ label: "🍎 Apple GPU", value: renderer });
                }
            }
        }
    }
    catch (e) {
        // Ignore errors
    }
    // Check for WebGL extensions specific to Safari
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
            const extensions = gl.getSupportedExtensions() || [];
            if (extensions.includes('WEBGL_compressed_texture_pvrtc')) {
                info.push({ label: "🗜️ PVRTC Support", value: "✅" });
            }
        }
    }
    catch (e) {
        // Ignore errors
    }
    return info;
}
function getDeviceType() {
    if (DeviceUtilities.isQuest())
        return "Meta Quest";
    if (DeviceUtilities.isVisionOS())
        return "Vision Pro";
    if (DeviceUtilities.isiOS()) {
        if (DeviceUtilities.isiPad())
            return "iPad";
        return "iPhone/iPod";
    }
    if (DeviceUtilities.isAndroidDevice())
        return "Android Device";
    if (DeviceUtilities.isMozillaXR())
        return "Mozilla XR Browser";
    if (DeviceUtilities.isNeedleAppClip())
        return "Needle App Clip";
    if (DeviceUtilities.isMacOS())
        return "Mac";
    if (DeviceUtilities.isDesktop())
        return "Desktop PC";
    return "Unknown Device";
}
function getConsoleSwitchButton() {
    const el = document.querySelector("#__vconsole .vc-switch");
    if (el)
        return el;
    return null;
}
function getConsoleElement() {
    const el = document.querySelector("#__vconsole");
    if (el)
        return el;
    return null;
}
//# sourceMappingURL=debug_console.js.map
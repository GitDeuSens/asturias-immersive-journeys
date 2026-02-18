import { isDevEnvironment } from "../debug/index.js";
/**
 * Internal registry for USDZ exporters. This is used by NeedleXRSession.start("immersive-ar")
 */
export var InternalUSDZRegistry;
(function (InternalUSDZRegistry) {
    const usdzExporter = [];
    function exportAndOpen() {
        if (!usdzExporter?.length) {
            if (isDevEnvironment()) {
                console.warn("No USDZ exporters found – cannot export USDZ for QuickLook.");
            }
        }
        for (const exp of usdzExporter) {
            exp.exportAndOpen();
        }
        return true;
    }
    InternalUSDZRegistry.exportAndOpen = exportAndOpen;
    function registerExporter(exporter) {
        usdzExporter.push(exporter);
    }
    InternalUSDZRegistry.registerExporter = registerExporter;
    function unregisterExporter(exporter) {
        if (!usdzExporter)
            return;
        const index = usdzExporter.indexOf(exporter);
        if (index >= 0) {
            usdzExporter.splice(index, 1);
        }
    }
    InternalUSDZRegistry.unregisterExporter = unregisterExporter;
})(InternalUSDZRegistry || (InternalUSDZRegistry = {}));
//# sourceMappingURL=usdz.js.map
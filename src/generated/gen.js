globalThis["needle:dependencies:ready"] = import("./register_types.ts")

export const needle_exported_files = new Array();
globalThis["needle:codegen_files"] = needle_exported_files;
import url_0 from "/assets/BaseEnvironment_Scene.glb?url";
needle_exported_files.push(url_0);
document.addEventListener("DOMContentLoaded", () =>
{
	const needleEngine = document.querySelector("needle-engine");
	if(needleEngine && needleEngine.getAttribute("src") === null)
	{
		needleEngine.setAttribute("hash", "1771410715760");
		needleEngine.setAttribute("src", JSON.stringify(needle_exported_files));
	}
});

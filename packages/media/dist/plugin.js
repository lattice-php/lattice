import { registerMediaImage } from "./rich-editor/media-image.js";
import { lazyComponent } from "@lattice-php/core";
//#region resources/js/plugin.ts
registerMediaImage();
var plugin_default = {
	name: "media",
	components: {
		"media.library": lazyComponent(() => import("./library.js")),
		"field.media-picker": lazyComponent(() => import("./media-picker.js"))
	},
	i18n: { namespace: "media" }
};
//#endregion
export { plugin_default as default };

//# sourceMappingURL=plugin.js.map
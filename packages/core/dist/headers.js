import { withRefHeader } from "@lattice-php/core/component-ref";
import { localeHeader } from "@lattice-php/core/i18n/locale";
//#region resources/js/headers.ts
function withHeaders(componentRef = "", headers = {}) {
	return {
		...localeHeader(),
		...withRefHeader(componentRef),
		...headers
	};
}
//#endregion
export { withHeaders };

//# sourceMappingURL=headers.js.map
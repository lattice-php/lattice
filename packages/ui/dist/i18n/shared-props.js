import { isRecord } from "@lattice-php/core/materialize";
//#region resources/js/i18n/shared-props.ts
function isStringArray(value) {
	return Array.isArray(value) && value.every((item) => typeof item === "string");
}
function isI18nConfig(value) {
	return isRecord(value) && typeof value.enabled === "boolean" && typeof value.saveMissing === "boolean" && isStringArray(value.locales) && isStringArray(value.preloadLocales) && (value.timezone === void 0 || value.timezone === null || typeof value.timezone === "string");
}
/**
* Parse the backend-shared `lattice.i18n` Inertia prop. Lives apart from the
* configure entrypoint so callers can inspect the prop without pulling the
* i18next backend into their bundle.
*/
function i18nConfigFromPageProps(props) {
	if (!isRecord(props)) return;
	const shared = props.lattice;
	const config = isRecord(shared) ? shared.i18n : void 0;
	return isI18nConfig(config) ? config : void 0;
}
//#endregion
export { i18nConfigFromPageProps };

//# sourceMappingURL=shared-props.js.map
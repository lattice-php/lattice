import { configureI18n } from "./backend.js";
import { i18nConfigFromPageProps } from "./shared-props.js";
//#region resources/js/i18n/page-props.ts
function configureI18nFromPageProps(props, options = {}) {
	return configureI18n(i18nConfigFromPageProps(props), options);
}
//#endregion
export { configureI18nFromPageProps, i18nConfigFromPageProps };

//# sourceMappingURL=page-props.js.map
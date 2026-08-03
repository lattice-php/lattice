import { useT } from "./instance.js";
//#region resources/js/i18n/locale-switcher.tsx
function useLocaleOptions({ namespace = "lattice", label } = {}) {
	const { t, locale, locales, setLocale } = useT(namespace);
	const values = locales.length > 0 ? locales : [locale];
	const labelFor = label ?? ((value) => t(`language.${value}`, value));
	return {
		locale,
		locales: values,
		options: values.map((value) => ({
			value,
			label: labelFor(value),
			active: value === locale
		})),
		setLocale
	};
}
//#endregion
export { useLocaleOptions };

//# sourceMappingURL=locale-switcher.js.map
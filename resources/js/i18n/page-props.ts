import { configureI18n, type ConfigureI18nOptions } from "./backend";
import { i18nConfigFromPageProps } from "./shared-props";

export { i18nConfigFromPageProps };

export function configureI18nFromPageProps(
  props: unknown,
  options: ConfigureI18nOptions = {},
): Promise<void> {
  return configureI18n(i18nConfigFromPageProps(props), options);
}

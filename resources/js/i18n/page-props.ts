import { configureI18n, type ConfigureI18nOptions, type I18nConfig } from "./backend";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isI18nConfig(value: unknown): value is I18nConfig {
  return (
    isRecord(value) &&
    typeof value.enabled === "boolean" &&
    typeof value.saveMissing === "boolean" &&
    isStringArray(value.locales) &&
    isStringArray(value.preloadLocales)
  );
}

export function i18nConfigFromPageProps(props: unknown): I18nConfig | undefined {
  if (!isRecord(props)) {
    return undefined;
  }

  const shared = props.lattice;
  const config = isRecord(shared) ? shared.i18n : undefined;

  return isI18nConfig(config) ? config : undefined;
}

export function configureI18nFromPageProps(
  props: unknown,
  options: ConfigureI18nOptions = {},
): Promise<void> {
  return configureI18n(i18nConfigFromPageProps(props), options);
}

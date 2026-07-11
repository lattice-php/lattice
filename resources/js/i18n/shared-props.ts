import type { I18nConfig } from "@lattice-php/lattice/types/generated";

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
    isStringArray(value.preloadLocales) &&
    (value.timezone === undefined || value.timezone === null || typeof value.timezone === "string")
  );
}

/**
 * Parse the backend-shared `lattice.i18n` Inertia prop. Lives apart from the
 * configure entrypoint so callers can inspect the prop without pulling the
 * i18next backend into their bundle.
 */
export function i18nConfigFromPageProps(props: unknown): I18nConfig | undefined {
  if (!isRecord(props)) {
    return undefined;
  }

  const shared = props.lattice;
  const config = isRecord(shared) ? shared.i18n : undefined;

  return isI18nConfig(config) ? config : undefined;
}

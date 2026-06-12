import i18next from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

const NAMESPACE = "lattice";

function detectLanguage(): string {
  if (typeof document !== "undefined" && document.documentElement.lang) {
    return document.documentElement.lang;
  }

  return "en";
}

/**
 * Lattice's own i18next instance, isolated from the host app's. The renderer's
 * chrome carries its English text inline via each `t(key, "Default")` call, so it
 * works with zero config; `enableBackend()` loads overrides from a backend
 * without ever touching the app's own translations.
 */
export const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  lng: detectLanguage(),
  fallbackLng: "en",
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

/**
 * Translation hook bound to Lattice's instance. Defaults to the single `lattice`
 * namespace (nested keys like `editor.bold`), which is collision-safe with the
 * host app's own namespaces; pass another namespace to read from it instead.
 * Call sites supply the English inline: `t("editor.bold", "Bold")`.
 */
export function useT(namespace: string = NAMESPACE) {
  return useTranslation(namespace, { i18n });
}

/** Translate a chrome key with an inline fallback outside of a component. */
export function translate(
  key: string,
  defaultValue: string,
  options?: Record<string, unknown>,
): string {
  return i18n.t(key, defaultValue, options);
}

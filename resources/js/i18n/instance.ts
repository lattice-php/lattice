import i18next from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import en from "./locales/en";

const NAMESPACE = "lattice";

function detectLanguage(): string {
  if (typeof document !== "undefined" && document.documentElement.lang) {
    return document.documentElement.lang;
  }

  return "en";
}

/**
 * Lattice's own i18next instance, isolated from the host app's. The renderer's
 * chrome (toolbar, pagination, a11y labels) reads from here with bundled English
 * defaults, so it works with zero config; `enableBackend()` loads overrides from
 * a backend without ever touching the app's own translations.
 */
export const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  lng: detectLanguage(),
  fallbackLng: "en",
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  resources: { en: { [NAMESPACE]: en } },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

/**
 * Translation hook bound to Lattice's instance. Defaults to the single `lattice`
 * namespace (nested keys like `editor.bold`), which is collision-safe with the
 * host app's own namespaces; pass another namespace to read from it instead.
 */
export function useT(namespace: string = NAMESPACE) {
  return useTranslation(namespace, { i18n });
}

/** Translate a chrome key outside of a component (helpers, maps). */
export function translate(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

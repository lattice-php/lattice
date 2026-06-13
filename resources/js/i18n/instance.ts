import i18next, { type i18n as I18nInstance, type InitOptions } from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

const NAMESPACE = "lattice";

function detectLanguage(): string {
  if (typeof document !== "undefined" && document.documentElement.lang) {
    return document.documentElement.lang;
  }

  return "en";
}

/** Lattice's own i18next instance, isolated from the host app's. */
export const i18n: I18nInstance = i18next.createInstance().use(initReactI18next);

let initialization: Promise<unknown> | undefined;

/**
 * Initialize the instance exactly once. The first caller wins — a rendered
 * component (inline English, zero config) or `enableBackend()`, which registers
 * its backend first because i18next can only wire a backend during `init`.
 */
export function ensureI18n(extend?: (base: InitOptions) => InitOptions): Promise<unknown> {
  if (!initialization) {
    const base: InitOptions = {
      lng: detectLanguage(),
      fallbackLng: "en",
      ns: [NAMESPACE],
      defaultNS: NAMESPACE,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    };

    initialization = i18n.init(extend ? extend(base) : base);
  }

  return initialization;
}

/** Translation hook bound to Lattice's instance. The chrome passes `"lattice"`; consumers pass their own namespace. */
export function useT(namespace: string) {
  ensureI18n();

  return useTranslation(namespace, { i18n });
}

/** Translate a key in the given namespace with an inline fallback, outside of a component. */
export function translate(
  namespace: string,
  key: string,
  defaultValue: string,
  options?: Record<string, unknown>,
): string {
  ensureI18n();

  return i18n.t(key, defaultValue, { ns: namespace, ...options });
}

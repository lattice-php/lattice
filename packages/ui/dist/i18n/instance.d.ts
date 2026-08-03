import { i18n as I18nInstance, InitOptions } from "i18next";
export declare const DEFAULT_NAMESPACE = "lattice";
type TranslationFunction = (
  key: string,
  defaultValue?: string,
  options?: Record<string, unknown>,
) => string;
type TranslationResult = {
  t: TranslationFunction;
  i18n: I18nInstance;
  locale: string;
  locales: readonly string[];
  ready: boolean;
  setLocale: (locale: string) => void;
};
export declare const i18n: I18nInstance;
/**
 * Defer component-driven initialization until `until` settles — for shells
 * that render before the i18n bootstrap has loaded (SSR hydration), where the
 * first rendered `useT` would otherwise win the init race and lock the HTTP
 * backend out. Configuring callers (those passing `extend` to {@link ensureI18n})
 * bypass the hold; a failed bootstrap releases it, so init stays fail-open.
 */
export declare function holdI18nInit(until: Promise<unknown>): void;
/**
 * Initialize the instance exactly once. The first caller wins — a rendered
 * component (inline English, zero config) or `enableBackend()`, which registers
 * its backend first because i18next can only wire a backend during `init`.
 */
export declare function ensureI18n(extend?: (base: InitOptions) => InitOptions): Promise<unknown>;
/**
 * Eagerly load the namespaces for the given locales so a later
 * `changeLanguage` resolves them from the store instead of an HTTP round-trip,
 * which would otherwise flash the fallback language on switch. The active
 * locale is already loaded by {@link ensureI18n}, so it is skipped.
 */
export declare function preloadLanguages(locales: readonly string[]): Promise<void>;
export declare function useT(namespace: string): TranslationResult;
export declare function translate(
  namespace: string,
  key: string,
  defaultValue: string,
  options?: Record<string, unknown>,
): string;

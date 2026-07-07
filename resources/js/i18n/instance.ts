import i18next, { type i18n as I18nInstance, type InitOptions } from "i18next";
import { useCallback, useSyncExternalStore } from "react";
import { useConfig } from "./config";
import { currentLocale, subscribeLocale, useLocale } from "./locale";

const NAMESPACE = "lattice";

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

export const i18n: I18nInstance = i18next.createInstance();

let initialization: Promise<unknown> | undefined;
let revision = 0;

function subscribe(onStoreChange: () => void): () => void {
  const listener = () => {
    revision += 1;
    onStoreChange();
  };

  i18n.on("initialized", listener);
  i18n.on("loaded", listener);
  i18n.on("languageChanged", listener);
  i18n.store?.on("added", listener);
  i18n.store?.on("removed", listener);

  return () => {
    i18n.off("initialized", listener);
    i18n.off("loaded", listener);
    i18n.off("languageChanged", listener);
    i18n.store?.off("added", listener);
    i18n.store?.off("removed", listener);
  };
}

function snapshot(): number {
  return revision;
}

/**
 * Initialize the instance exactly once. The first caller wins — a rendered
 * component (inline English, zero config) or `enableBackend()`, which registers
 * its backend first because i18next can only wire a backend during `init`.
 */
export function ensureI18n(extend?: (base: InitOptions) => InitOptions): Promise<unknown> {
  if (!initialization) {
    const base: InitOptions = {
      lng: currentLocale(),
      fallbackLng: "en",
      ns: [NAMESPACE],
      defaultNS: NAMESPACE,
      interpolation: { escapeValue: false },
    };

    initialization = i18n.init(extend ? extend(base) : base);
  }

  return initialization;
}

subscribeLocale((locale) => {
  void ensureI18n().then(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  });
});

/**
 * Eagerly load the namespaces for the given locales so a later
 * `changeLanguage` resolves them from the store instead of an HTTP round-trip,
 * which would otherwise flash the fallback language on switch. The active
 * locale is already loaded by {@link ensureI18n}, so it is skipped.
 */
export async function preloadLanguages(locales: readonly string[]): Promise<void> {
  const pending = locales.filter((locale) => locale !== currentLocale());

  if (pending.length === 0) {
    return;
  }

  await ensureI18n();
  await i18n.loadLanguages([...pending]);
}

export function useT(namespace: string): TranslationResult {
  ensureI18n();
  useSyncExternalStore(subscribe, snapshot, snapshot);
  const { locales } = useConfig();
  const { locale, setLocale } = useLocale();

  const t = useCallback<TranslationFunction>(
    (key, defaultValue = key, options = {}) => translate(namespace, key, defaultValue, options),
    [namespace],
  );

  return { t, i18n, locale, locales, ready: i18n.isInitialized, setLocale };
}

export function translate(
  namespace: string,
  key: string,
  defaultValue: string,
  options?: Record<string, unknown>,
): string {
  ensureI18n();

  if (!i18n.isInitialized || !i18n.hasLoadedNamespace(namespace)) {
    return i18n.t(key, defaultValue, { ns: namespace, ...options, saveMissing: false });
  }

  return i18n.t(key, defaultValue, { ns: namespace, ...options });
}

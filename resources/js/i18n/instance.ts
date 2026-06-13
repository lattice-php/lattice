import i18next, { type i18n as I18nInstance, type InitOptions } from "i18next";
import { useCallback, useSyncExternalStore } from "react";

const NAMESPACE = "lattice";

type TranslationFunction = (
  key: string,
  defaultValue?: string,
  options?: Record<string, unknown>,
) => string;

export type TranslationResult = {
  t: TranslationFunction;
  i18n: I18nInstance;
  ready: boolean;
};

function detectLanguage(): string {
  if (typeof document !== "undefined" && document.documentElement.lang) {
    return document.documentElement.lang;
  }

  return "en";
}

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
      lng: detectLanguage(),
      fallbackLng: "en",
      ns: [NAMESPACE],
      defaultNS: NAMESPACE,
      interpolation: { escapeValue: false },
    };

    initialization = i18n.init(extend ? extend(base) : base);
  }

  return initialization;
}

export function useT(namespace: string): TranslationResult {
  ensureI18n();
  useSyncExternalStore(subscribe, snapshot, snapshot);

  const t = useCallback<TranslationFunction>(
    (key, defaultValue = key, options = {}) => translate(namespace, key, defaultValue, options),
    [namespace],
  );

  return { t, i18n, ready: i18n.isInitialized };
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

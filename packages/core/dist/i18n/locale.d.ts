export type UseLocaleReturn = {
  readonly locale: string;
  readonly setLocale: (locale: string) => void;
};
export declare function currentLocale(): string;
export declare function localeHeader(): Record<string, string>;
export declare function subscribeLocale(callback: (locale: string) => void): () => void;
export declare function setLocale(locale: string): void;
export declare function useLocale(): UseLocaleReturn;

export type LocaleOption = {
  readonly value: string;
  readonly label: string;
  readonly active: boolean;
};
export type UseLocaleOptionsOptions = {
  readonly namespace?: string;
  readonly label?: (locale: string) => string;
};
export type UseLocaleOptionsReturn = {
  readonly locale: string;
  readonly locales: readonly string[];
  readonly options: readonly LocaleOption[];
  readonly setLocale: (locale: string) => void;
};
export declare function useLocaleOptions({
  namespace,
  label,
}?: UseLocaleOptionsOptions): UseLocaleOptionsReturn;

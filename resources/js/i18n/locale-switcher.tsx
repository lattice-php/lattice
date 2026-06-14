import type { ReactNode } from "react";
import { useT } from "./instance";

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

export type LocaleSwitcherProps = UseLocaleOptionsOptions & {
  readonly children: (state: UseLocaleOptionsReturn) => ReactNode;
};

export function useLocaleOptions({
  namespace = "lattice",
  label,
}: UseLocaleOptionsOptions = {}): UseLocaleOptionsReturn {
  const { t, locale, locales, setLocale } = useT(namespace);
  const values = locales.length > 0 ? locales : [locale];
  const labelFor = label ?? ((value: string): string => t(`language.${value}`, value));

  return {
    locale,
    locales: values,
    options: values.map((value) => ({
      value,
      label: labelFor(value),
      active: value === locale,
    })),
    setLocale,
  };
}

export function LocaleSwitcher({ children, ...options }: LocaleSwitcherProps) {
  return <>{children(useLocaleOptions(options))}</>;
}

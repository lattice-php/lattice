import { useMemo } from "react";
import { useLocale } from "../i18n/locale";
import { useTimezone } from "../i18n/timezone";

export type FormatContext = { locale: string; timezone: string };

export function useFormatContext(): FormatContext {
  const { locale } = useLocale();
  const { timezone } = useTimezone();

  return useMemo(() => ({ locale, timezone }), [locale, timezone]);
}

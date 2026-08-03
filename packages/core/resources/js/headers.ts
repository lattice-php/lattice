import { localeHeader } from "@lattice-php/core/i18n/locale";
import { withRefHeader } from "@lattice-php/core/component-ref";

export function withHeaders(
  componentRef = "",
  headers: Record<string, string> = {},
): Record<string, string> {
  return {
    ...localeHeader(),
    ...withRefHeader(componentRef),
    ...headers,
  };
}

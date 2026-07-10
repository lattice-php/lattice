import { localeHeader } from "@lattice-php/lattice/i18n/locale";
import { withRefHeader } from "./component-ref";

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

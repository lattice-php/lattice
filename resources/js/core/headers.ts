import { localeHeader } from "../i18n/locale";
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

export function xsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : "";
}

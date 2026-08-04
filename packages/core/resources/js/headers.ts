import { withRefHeader } from "./component-ref";

type RequestHeaderProvider = () => Record<string, string>;

let requestHeaderProvider: RequestHeaderProvider = () => ({});

export function setRequestHeaderProvider(provider: RequestHeaderProvider): void {
  requestHeaderProvider = provider;
}

export function withRequestHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return { ...requestHeaderProvider(), ...headers };
}

export function withHeaders(
  componentRef = "",
  headers: Record<string, string> = {},
): Record<string, string> {
  return {
    ...withRequestHeaders(),
    ...withRefHeader(componentRef),
    ...headers,
  };
}

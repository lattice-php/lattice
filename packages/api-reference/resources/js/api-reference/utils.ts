import type { Contract } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2) ?? "";
}

export function isAbortError(error: unknown): error is { name: string } {
  return (
    typeof error === "object" && error !== null && "name" in error && error.name === "AbortError"
  );
}

export function contractLabel(contract: Contract): string {
  return (
    [contract.status, contract.mediaType]
      .filter((part): part is string => Boolean(part))
      .join(" ") || "default"
  );
}

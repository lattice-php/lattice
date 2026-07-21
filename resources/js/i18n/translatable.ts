import type { Translatable } from "@lattice-php/lattice/types/generated";

export type Translate = (
  key: string,
  defaultValue?: string,
  options?: Record<string, unknown>,
) => string;

export function isTranslatable(value: unknown): value is Translatable {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { key?: unknown }).key === "string"
  );
}

function readPath(payload: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((node, segment) => {
    if (typeof node === "object" && node !== null) {
      return (node as Record<string, unknown>)[segment];
    }

    return undefined;
  }, payload);
}

export function resolveText(value: string | Translatable | null, t: Translate): string | null {
  return isTranslatable(value) ? resolveTranslatable(value, {}, t) : value;
}

export function resolveTranslatable(
  value: Translatable,
  payload: Record<string, unknown>,
  t: Translate,
): string {
  const fromPayload: Record<string, unknown> = {};

  for (const [name, path] of Object.entries(value.payload)) {
    const read = readPath(payload, path);
    fromPayload[name] = read === undefined ? "" : read;
  }

  return t(value.key, value.key, { ...value.replacements, ...fromPayload });
}

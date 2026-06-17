import type { Effect } from "@lattice-php/lattice/types/generated";

export type RawEffect = Record<string, unknown>;

export type Translate = (
  key: string,
  defaultValue?: string,
  options?: Record<string, unknown>,
) => string;

type WireTranslatable = {
  key: string;
  payload?: Record<string, string>;
  replacements?: Record<string, unknown>;
};

function isTranslatable(value: unknown): value is WireTranslatable {
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

function resolveTranslatable(
  value: WireTranslatable,
  payload: Record<string, unknown>,
  t: Translate,
): string {
  const fromPayload: Record<string, unknown> = {};

  for (const [name, path] of Object.entries(value.payload ?? {})) {
    const read = readPath(payload, path);
    fromPayload[name] = read === undefined ? "" : read;
  }

  return t(value.key, value.key, { ...value.replacements, ...fromPayload });
}

export function buildEffects(
  effects: readonly RawEffect[],
  payload: Record<string, unknown>,
  t: Translate,
): Effect[] {
  return effects.map((effect) => resolveEffect(effect, payload, t)) as Effect[];
}

function resolveEffect(
  effect: RawEffect,
  payload: Record<string, unknown>,
  t: Translate,
): RawEffect {
  if (effect.type !== "toast") {
    return effect;
  }

  const toast = effect.toast;

  if (typeof toast !== "object" || toast === null) {
    return effect;
  }

  const message = (toast as Record<string, unknown>).message;

  if (!isTranslatable(message)) {
    return effect;
  }

  return {
    ...effect,
    toast: {
      ...(toast as Record<string, unknown>),
      message: resolveTranslatable(message, payload, t),
    },
  };
}

import { Translatable } from "../types.js";
export type Translate = (
  key: string,
  defaultValue?: string,
  options?: Record<string, unknown>,
) => string;
export declare function isTranslatable(value: unknown): value is Translatable;
export declare function resolveText(
  value: string | Translatable | null,
  t: Translate,
): string | null;
export declare function resolveTranslatable(
  value: Translatable,
  payload: Record<string, unknown>,
  t: Translate,
): string;

import { isRecord } from "./utils";

export function parameterTypeLabel(schema: unknown): string {
  if (!isRecord(schema)) {
    return "any";
  }

  if (typeof schema.$ref === "string") {
    return schema.$ref.split("/").pop() ?? "ref";
  }

  for (const [keyword, separator] of [
    ["oneOf", " | "],
    ["anyOf", " | "],
    ["allOf", " & "],
  ] as const) {
    const variants = schema[keyword];
    if (Array.isArray(variants) && variants.length > 0) {
      return [...new Set(variants.map(parameterTypeLabel))].join(separator);
    }
  }

  if (Array.isArray(schema.type)) {
    return schema.type.join(" | ");
  }

  if (typeof schema.type === "string") {
    return schema.type === "array" && schema.items
      ? `${parameterTypeLabel(schema.items)}[]`
      : schema.type;
  }

  return Array.isArray(schema.enum) ? "enum" : "any";
}

export function parameterAllowedValues(schema: unknown): string[] {
  if (!isRecord(schema)) {
    return [];
  }

  if (Array.isArray(schema.enum)) {
    return schema.enum.map(displayValue);
  }

  if (schema.type === "array" && isRecord(schema.items) && Array.isArray(schema.items.enum)) {
    return schema.items.enum.map(displayValue);
  }

  return [];
}

function displayValue(value: unknown): string {
  return typeof value === "string" ? value : (JSON.stringify(value) ?? String(value));
}

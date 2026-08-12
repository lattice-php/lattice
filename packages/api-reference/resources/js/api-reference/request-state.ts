import { initialRequestExample } from "./schema-example";
import type { Contract, Operation, Param } from "./types";
import { isRecord, prettyJson } from "./utils";

export type RequestValues = {
  parameters: Record<string, string>;
  mediaType: string | null;
  body: string;
};

export function parameterKey(param: Param): string {
  return `${param.location}:${param.name}`;
}

export function isJsonMediaType(mediaType: string | null): boolean {
  if (mediaType === null) {
    return false;
  }

  const normalized = mediaType.split(";", 1)[0].trim().toLowerCase();

  return normalized === "application/json" || normalized.endsWith("+json");
}

export function jsonRequestContracts(operation: Operation): Contract[] {
  return operation.requests.filter((contract) => isJsonMediaType(contract.mediaType));
}

export function initialRequestValues(operation: Operation, components?: unknown): RequestValues {
  const parameters = Object.fromEntries(
    operation.paramGroups.flatMap((group) =>
      group.params.map((param) => [parameterKey(param), initialParameterValue(param)]),
    ),
  );
  const contract = jsonRequestContracts(operation)[0];

  if (contract === undefined) {
    return { parameters, mediaType: null, body: "" };
  }

  return {
    parameters,
    mediaType: contract.mediaType,
    body: prettyJson(initialRequestExample(contract, components)),
  };
}

function initialParameterValue(param: Param): string {
  const directExample = parameterString(param.example);
  if (directExample !== null) {
    return directExample;
  }

  if (!isRecord(param.schema)) {
    return "";
  }

  for (const key of ["example", "default"] as const) {
    const value = parameterString(param.schema[key]);
    if (value !== null) {
      return value;
    }
  }

  return param.required && Array.isArray(param.schema.enum)
    ? (scalarString(param.schema.enum[0]) ?? "")
    : "";
}

function parameterString(value: unknown): string | null {
  if (!Array.isArray(value)) {
    return scalarString(value);
  }

  const items = value.map(scalarString);

  return items.every((item): item is string => item !== null) ? items.join(",") : null;
}

function scalarString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
}

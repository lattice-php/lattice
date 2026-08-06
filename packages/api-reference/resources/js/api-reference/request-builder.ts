import { isJsonMediaType, parameterKey, type RequestValues } from "./request-state";
import type { Contract, Operation, Param, SecuritySchemeRef } from "./types";
import { isRecord } from "./utils";

export type RequestErrors = {
  parameters: Record<string, string>;
  body: string | null;
  request: string | null;
};

export type BuiltRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
};

export type BuildRequestResult =
  | { request: BuiltRequest; errors: null }
  | { request: null; errors: RequestErrors };

const FORBIDDEN_HEADER_NAMES = new Set([
  "accept-charset",
  "accept-encoding",
  "access-control-request-headers",
  "access-control-request-method",
  "connection",
  "content-length",
  "cookie",
  "cookie2",
  "date",
  "dnt",
  "expect",
  "host",
  "keep-alive",
  "origin",
  "permissions-policy",
  "referer",
  "set-cookie",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via",
]);

const METHOD_OVERRIDE_HEADER_NAMES = new Set([
  "x-http-method",
  "x-http-method-override",
  "x-method-override",
]);

const FORBIDDEN_METHOD_OVERRIDE_VALUES = new Set(["CONNECT", "TRACE", "TRACK"]);

export function buildRequest(input: {
  operation: Operation;
  baseUrl: string | null;
  values: RequestValues;
  token: string | null;
}): BuildRequestResult {
  const errors: RequestErrors = {
    parameters: {},
    body: null,
    request: input.baseUrl === null ? "Select a server URL before sending the request." : null,
  };
  const parameters = input.operation.paramGroups.flatMap((group) => group.params);

  validateParameters(parameters, input.values, errors);
  const selectedContract = validateBody(input.operation, input.values, errors);

  if (hasErrors(errors) || input.baseUrl === null) {
    return { request: null, errors };
  }

  const headers = buildHeaders(parameters, input.values);
  const body = input.values.body.trim() === "" ? null : input.values.body;

  if (!Object.keys(headers).some((name) => name.toLowerCase() === "accept")) {
    headers.Accept = "application/json";
  }

  if (body !== null && selectedContract !== null && selectedContract.mediaType !== null) {
    upsertHeader(headers, "Content-Type", selectedContract.mediaType);
  }

  if (input.token !== null && input.token !== "" && operationAcceptsAccessToken(input.operation)) {
    upsertHeader(headers, "Authorization", `Bearer ${input.token}`);
  }

  return {
    request: {
      method: input.operation.summary.method,
      url: buildUrl(input.baseUrl, input.operation.summary.path, parameters, input.values),
      headers,
      body,
    },
    errors: null,
  };
}

export function isBearerAccessTokenScheme(scheme: SecuritySchemeRef): boolean {
  return (
    scheme.type === "oauth2" ||
    (scheme.type === "http" && scheme.scheme?.toLowerCase() === "bearer")
  );
}

function operationAcceptsAccessToken(operation: Operation): boolean {
  return operation.security.some((requirement) =>
    requirement.schemes.some(isBearerAccessTokenScheme),
  );
}

export function redactAuthorization(request: BuiltRequest): BuiltRequest {
  const headers = Object.fromEntries(
    Object.entries(request.headers).map(([name, value]) => [
      name,
      name.toLowerCase() === "authorization" && /^Bearer(?:\s|$)/i.test(value)
        ? "Bearer <YOUR_TOKEN>"
        : value,
    ]),
  );

  return { ...request, headers };
}

function validateParameters(
  parameters: Param[],
  values: RequestValues,
  errors: RequestErrors,
): void {
  for (const param of parameters) {
    const key = parameterKey(param);
    const value = values.parameters[key] ?? "";
    const limitation = parameterLimitation(param, value);

    if (limitation !== null) {
      if (param.required || value !== "") {
        errors.parameters[key] = limitation;
      }

      continue;
    }

    if (param.required && value === "") {
      errors.parameters[key] = `This ${param.location} parameter is required.`;

      continue;
    }

    const constraintError = parameterConstraintError(param, value);
    if (constraintError !== null) {
      errors.parameters[key] = constraintError;
    }
  }
}

function parameterConstraintError(param: Param, value: string): string | null {
  if (value === "" || !isRecord(param.schema)) {
    return null;
  }

  if (param.schema.type === "number" || param.schema.type === "integer") {
    return numericConstraintError(param.schema, value);
  }

  if (param.schema.type === "string") {
    return stringConstraintError(param.schema, value);
  }

  return null;
}

function numericConstraintError(schema: Record<string, unknown>, value: string): string | null {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "Enter a number.";
  }
  if (schema.type === "integer" && !Number.isInteger(number)) {
    return "Enter an integer.";
  }

  const minimum = numberValue(schema.minimum);
  const exclusiveMinimum =
    schema.exclusiveMinimum === true ? minimum : numberValue(schema.exclusiveMinimum);
  if (exclusiveMinimum !== null && number <= exclusiveMinimum) {
    return `Enter a value greater than ${exclusiveMinimum}.`;
  }
  if (minimum !== null && number < minimum) {
    return `Enter a value greater than or equal to ${minimum}.`;
  }

  const maximum = numberValue(schema.maximum);
  const exclusiveMaximum =
    schema.exclusiveMaximum === true ? maximum : numberValue(schema.exclusiveMaximum);
  if (exclusiveMaximum !== null && number >= exclusiveMaximum) {
    return `Enter a value less than ${exclusiveMaximum}.`;
  }
  if (maximum !== null && number > maximum) {
    return `Enter a value less than or equal to ${maximum}.`;
  }

  const multipleOf = numberValue(schema.multipleOf);
  if (multipleOf !== null && multipleOf > 0) {
    const quotient = number / multipleOf;
    if (Math.abs(quotient - Math.round(quotient)) > 1e-9) {
      return `Enter a multiple of ${multipleOf}.`;
    }
  }

  return null;
}

function stringConstraintError(schema: Record<string, unknown>, value: string): string | null {
  const length = [...value].length;
  const minLength = numberValue(schema.minLength);
  if (minLength !== null && length < minLength) {
    return `Enter at least ${minLength} characters.`;
  }

  const maxLength = numberValue(schema.maxLength);
  if (maxLength !== null && length > maxLength) {
    return `Enter no more than ${maxLength} characters.`;
  }

  if (typeof schema.pattern === "string") {
    try {
      if (!new RegExp(schema.pattern).test(value)) {
        return "Match the required pattern.";
      }
    } catch {
      return null;
    }
  }

  return null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parameterLimitation(param: Param, value?: string): string | null {
  if (!hasPrimitiveSchema(param) && !hasFormArraySchema(param)) {
    return "Only primitive parameters can be executed.";
  }

  if (param.location === "cookie") {
    return "Cookie parameters cannot be sent from a browser.";
  }

  if (param.location === "header" && isForbiddenHeader(param.name)) {
    return "This header cannot be sent from a browser.";
  }

  if (param.location === "header" && isForbiddenMethodOverride(param.name, value)) {
    return "This header cannot be sent from a browser.";
  }

  return null;
}

function validateBody(
  operation: Operation,
  values: RequestValues,
  errors: RequestErrors,
): Contract | null {
  if (values.mediaType === null) {
    const requiredContract = operation.requests.find(
      (contract) => contract.required && isJsonMediaType(contract.mediaType),
    );

    if (requiredContract !== undefined) {
      errors.body = "A JSON request body is required.";
    }

    return null;
  }

  const contract = operation.requests.find((candidate) => candidate.mediaType === values.mediaType);
  if (contract === undefined || !isJsonMediaType(contract.mediaType)) {
    errors.request = "The selected JSON media type is not available for this operation.";

    return null;
  }

  if (values.body.trim() === "") {
    if (contract.required) {
      errors.body = "A JSON request body is required.";
    }

    return contract;
  }

  try {
    JSON.parse(values.body);
  } catch {
    errors.body = "Enter a valid JSON request body.";
  }

  return contract;
}

function buildHeaders(parameters: Param[], values: RequestValues): Record<string, string> {
  return Object.fromEntries(
    parameters
      .filter((param) => param.location === "header")
      .map((param) => [param.name, values.parameters[parameterKey(param)] ?? ""])
      .filter((entry) => entry[1] !== ""),
  );
}

function buildUrl(
  baseUrl: string,
  path: string,
  parameters: Param[],
  values: RequestValues,
): string {
  let resolvedPath = path;
  const query: string[] = [];

  for (const param of parameters) {
    const value = values.parameters[parameterKey(param)] ?? "";

    if (param.location === "path") {
      resolvedPath = resolvedPath.split(`{${param.name}}`).join(encodeURIComponent(value));
    }

    if (param.location === "query" && value !== "") {
      query.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(value)}`);
    }
  }

  const baseWithoutFragment = baseUrl.split("#", 1)[0];
  const queryIndex = baseWithoutFragment.indexOf("?");
  const basePath =
    queryIndex === -1 ? baseWithoutFragment : baseWithoutFragment.slice(0, queryIndex);
  const existingQuery = queryIndex === -1 ? "" : baseWithoutFragment.slice(queryIndex + 1);
  const url = operationUrl(basePath, resolvedPath);
  const combinedQuery = [existingQuery, ...query].filter((value) => value !== "");

  return combinedQuery.length === 0 ? url : `${url}?${combinedQuery.join("&")}`;
}

export function operationUrl(baseUrl: string | null | undefined, path: string): string {
  const basePath = (baseUrl ?? "").split("#", 1)[0].split("?", 1)[0];

  return `${basePath.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function isForbiddenHeader(name: string): boolean {
  const normalized = name.toLowerCase();

  return (
    FORBIDDEN_HEADER_NAMES.has(normalized) ||
    normalized.startsWith("proxy-") ||
    normalized.startsWith("sec-")
  );
}

function isForbiddenMethodOverride(name: string, value: string | undefined): boolean {
  if (value === undefined) return false;

  const normalizedName = name.toLowerCase();

  return (
    METHOD_OVERRIDE_HEADER_NAMES.has(normalizedName) &&
    value
      .split(",")
      .some((method) => FORBIDDEN_METHOD_OVERRIDE_VALUES.has(method.trim().toUpperCase()))
  );
}

function hasPrimitiveSchema(param: Param): boolean {
  if (!isRecord(param.schema)) {
    return false;
  }

  if (
    "$ref" in param.schema ||
    "oneOf" in param.schema ||
    "allOf" in param.schema ||
    "anyOf" in param.schema
  ) {
    return false;
  }

  return (
    typeof param.schema.type === "string" &&
    ["string", "number", "integer", "boolean"].includes(param.schema.type)
  );
}

function hasFormArraySchema(param: Param): boolean {
  if (
    param.location !== "query" ||
    (param.style !== undefined && param.style !== null && param.style !== "form")
  ) {
    return false;
  }

  if (param.explode !== false || !isRecord(param.schema) || param.schema.type !== "array") {
    return false;
  }

  const items = param.schema.items;

  return (
    isRecord(items) &&
    items.type === "string" &&
    Array.isArray(items.enum) &&
    items.enum.length > 0 &&
    items.enum.every((value) => typeof value === "string")
  );
}

function upsertHeader(headers: Record<string, string>, name: string, value: string): void {
  for (const existingName of Object.keys(headers)) {
    if (existingName.toLowerCase() === name.toLowerCase()) {
      delete headers[existingName];
    }
  }

  headers[name] = value;
}

function hasErrors(errors: RequestErrors): boolean {
  return (
    Object.keys(errors.parameters).length > 0 || errors.body !== null || errors.request !== null
  );
}

import type {
  ApiInfo,
  Contract,
  ContractExample,
  Navigation,
  NavGroup,
  Operation,
  OperationSummary,
  Param,
  ParamGroup,
  SecurityRequirement,
  Server,
} from "./types";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "options", "head", "trace"];

const PARAM_LOCATION_ORDER = ["path", "query", "header", "cookie"];

const DEFAULT_GROUP_TITLE = "Default";

type RawParameter = {
  name: string;
  in: string;
  required?: boolean;
  deprecated?: boolean;
  description?: string | null;
  "x-tooltip"?: string | null;
  schema?: unknown;
  example?: unknown;
  examples?: Record<string, RawExample>;
  style?: string | null;
  explode?: boolean | null;
  $ref?: string;
};

type RawExample = {
  summary?: string | null;
  description?: string | null;
  value?: unknown;
  externalValue?: string | null;
  $ref?: string;
};

type RawMediaTypeObject = {
  schema?: unknown;
  example?: unknown;
  examples?: Record<string, RawExample>;
};

type RawRequestBody = {
  $ref?: string;
  description?: string | null;
  required?: boolean;
  content?: Record<string, RawMediaTypeObject>;
};

type RawResponse = {
  $ref?: string;
  description?: string | null;
  content?: Record<string, RawMediaTypeObject>;
  headers?: Record<string, RawParameter>;
};

type RawSecurityScheme = {
  $ref?: string;
  type?: string;
  scheme?: string;
};

type RawOperation = {
  operationId?: string;
  summary?: string;
  description?: string | null;
  "x-tooltip"?: string | null;
  tags?: string[];
  deprecated?: boolean;
  parameters?: RawParameter[];
  requestBody?: RawRequestBody;
  responses?: Record<string, RawResponse>;
  security?: Array<Record<string, string[]>>;
  servers?: RawServer[];
};

type RawPathItem = Record<string, unknown> & {
  parameters?: RawParameter[];
  servers?: RawServer[];
};

type RawServer = {
  url?: string;
  description?: string | null;
  variables?: Record<string, { default?: unknown }>;
};

type RawComponents = {
  parameters?: Record<string, RawParameter>;
  requestBodies?: Record<string, RawRequestBody>;
  responses?: Record<string, RawResponse>;
  examples?: Record<string, RawExample>;
  headers?: Record<string, RawParameter>;
  securitySchemes?: Record<string, RawSecurityScheme>;
};

type RawSpec = {
  info?: { title?: string; version?: string | null; description?: string | null };
  paths?: Record<string, RawPathItem>;
  servers?: RawServer[];
  security?: Array<Record<string, string[]>>;
  components?: RawComponents;
};

type ComponentKind = keyof RawComponents;

/**
 * Derives a stable slug from a path so client-derived operation ids stay stable for deep-linking.
 */
function slug(path: string): string {
  const stripped = path.replaceAll("/", "-").replaceAll("{", "").replaceAll("}", "");
  const trimmed = stripped.replace(/^-+|-+$/g, "");

  return trimmed;
}

function operationId(method: string, path: string): string {
  const pathSlug = slug(path);

  return pathSlug === "" ? `${method}-root` : `${method}-${pathSlug}`;
}

function operationTitle(operation: RawOperation, method: string, path: string): string {
  if (typeof operation.summary === "string" && operation.summary !== "") {
    return operation.summary;
  }
  if (typeof operation.operationId === "string" && operation.operationId !== "") {
    return operation.operationId;
  }

  return `${method.toUpperCase()} ${path}`;
}

function resolveRef<T>(spec: RawSpec, ref: string | undefined, kind: ComponentKind): T | null {
  if (typeof ref !== "string") return null;
  const name = ref.split("/").pop();
  if (!name) return null;

  return (spec?.components?.[kind]?.[name] as T | undefined) ?? null;
}

function findOperation(
  spec: RawSpec,
  opId: string,
): { path: string; method: string; pathItem: RawPathItem; operation: RawOperation } | null {
  const paths = spec.paths ?? {};

  for (const path of Object.keys(paths)) {
    const pathItem = paths[path] as RawPathItem;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method] as RawOperation | undefined;
      if (!operation || typeof operation !== "object") continue;
      if (operationId(method, path) === opId) {
        return { path, method, pathItem, operation };
      }
    }
  }

  return null;
}

function normalizeServers(servers: unknown): Server[] {
  if (!Array.isArray(servers)) return [];

  return servers
    .filter((server): server is RawServer & { url: string } => typeof server?.url === "string")
    .map((server) => ({
      url: substituteServerVariables(server.url, server.variables),
      description: server.description ?? null,
    }));
}

function substituteServerVariables(url: string, variables: RawServer["variables"]): string {
  if (!variables) return url;

  return url.replaceAll(/\{([^{}]+)\}/g, (placeholder, name: string) => {
    const defaultValue = variables[name]?.default;

    return defaultValue === undefined ? placeholder : String(defaultValue);
  });
}

function buildServers(spec: RawSpec): Server[] {
  const servers = normalizeServers(spec.servers);

  return servers.length > 0 ? servers : [{ url: "/", description: null }];
}

export function buildNavigation(input: unknown): Navigation {
  const spec = asRawSpec(input);
  const info: ApiInfo = {
    title: spec.info?.title ?? "",
    version: spec.info?.version ?? null,
    description: spec.info?.description ?? null,
  };

  const summaries: Record<string, OperationSummary> = {};
  const operationIdsByTag = new Map<string, string[]>();

  const paths = spec.paths ?? {};
  for (const path of Object.keys(paths)) {
    const pathItem = paths[path] as RawPathItem;

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method] as RawOperation | undefined;
      if (!operation || typeof operation !== "object") continue;

      const id = operationId(method, path);
      summaries[id] = {
        id,
        method: method.toUpperCase(),
        path,
        title: operationTitle(operation, method, path),
        deprecated: Boolean(operation.deprecated),
      };

      const tags =
        operation.tags && operation.tags.length > 0 ? operation.tags : [DEFAULT_GROUP_TITLE];
      for (const tag of tags) {
        const ids = operationIdsByTag.get(tag) ?? [];
        ids.push(id);
        operationIdsByTag.set(tag, ids);
      }
    }
  }

  const groups: NavGroup[] = Array.from(operationIdsByTag.entries()).map(([tag, operationIds]) => ({
    id: slugifyTag(tag),
    title: tag,
    operationIds,
  }));

  return { info, groups, summaries, servers: buildServers(spec) };
}

function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildParam(spec: RawSpec, parameter: RawParameter): Param {
  const schema = parameter.schema ?? {};

  return {
    name: parameter.name,
    location: parameter.in,
    required: Boolean(parameter.required),
    deprecated: Boolean(parameter.deprecated),
    description: parameter.description ?? null,
    tooltip: parameter["x-tooltip"] ?? null,
    schema,
    example: parameterExample(spec, parameter, schema),
    ...(parameter.style === undefined ? {} : { style: parameter.style }),
    ...(parameter.explode === undefined ? {} : { explode: parameter.explode }),
  };
}

function parameterExample(spec: RawSpec, parameter: RawParameter, schema: unknown): unknown {
  if (parameter.example !== undefined) {
    return parameter.example;
  }

  const namedExample = firstExampleValue(spec, parameter.examples);
  if (namedExample !== undefined) {
    return namedExample;
  }

  const schemaExample = schemaValue(schema, "example");
  if (schemaExample !== undefined) {
    return schemaExample;
  }

  const schemaExamples = schemaValue(schema, "examples");
  if (Array.isArray(schemaExamples) && schemaExamples.length > 0) {
    return schemaExamples[0];
  }

  return schemaValue(schema, "default") ?? null;
}

function firstExampleValue(
  spec: RawSpec,
  examples: Record<string, RawExample> | undefined,
): unknown | undefined {
  if (!examples) return undefined;

  for (const example of Object.values(examples)) {
    const resolved = example.$ref
      ? (resolveRef<RawExample>(spec, example.$ref, "examples") ?? example)
      : example;

    if (resolved.value !== undefined) {
      return resolved.value;
    }
  }

  return undefined;
}

function schemaValue(
  schema: unknown,
  key: "example" | "examples" | "default",
): unknown | undefined {
  if (typeof schema !== "object" || schema === null || !(key in schema)) {
    return undefined;
  }

  return (schema as Record<string, unknown>)[key];
}

function buildResponseHeaders(
  spec: RawSpec,
  headers: Record<string, RawParameter> | undefined,
): Param[] {
  if (!headers) return [];

  return Object.entries(headers).map(([name, header]) => {
    const resolved = header.$ref
      ? (resolveRef<RawParameter>(spec, header.$ref, "headers") ?? header)
      : header;

    return buildParam(spec, { ...resolved, name, in: "header" });
  });
}

function buildParamGroups(
  spec: RawSpec,
  sharedParameters: RawParameter[],
  operationParameters: RawParameter[],
): ParamGroup[] {
  const merged = new Map<string, RawParameter>();

  for (const parameters of [sharedParameters, operationParameters]) {
    for (const parameter of parameters) {
      const resolved = parameter.$ref
        ? (resolveRef<RawParameter>(spec, parameter.$ref, "parameters") ?? parameter)
        : parameter;
      merged.set(`${resolved.in}::${resolved.name}`, resolved);
    }
  }

  const buckets = new Map<string, Param[]>();
  for (const parameter of merged.values()) {
    const bucket = buckets.get(parameter.in) ?? [];
    bucket.push(buildParam(spec, parameter));
    buckets.set(parameter.in, bucket);
  }

  const groups: ParamGroup[] = [];
  for (const location of PARAM_LOCATION_ORDER) {
    const params = buckets.get(location);
    if (params && params.length > 0) {
      groups.push({ location, params });
    }
  }

  return groups;
}

function buildExamples(
  spec: RawSpec,
  mediaTypeObject: RawMediaTypeObject | undefined,
): ContractExample[] {
  if (!mediaTypeObject) return [];

  const named = mediaTypeObject.examples;
  if (named && Object.keys(named).length > 0) {
    return Object.entries(named).map(([name, ex]) => {
      const resolved =
        ex && typeof ex === "object" && "$ref" in ex
          ? (resolveRef<RawExample>(spec, ex.$ref, "examples") ?? ex)
          : ex;

      return {
        name,
        summary: resolved?.summary ?? null,
        ...(resolved?.description === undefined ? {} : { description: resolved.description }),
        ...(resolved?.externalValue === undefined ? {} : { externalValue: resolved.externalValue }),
        value: resolved?.value,
      };
    });
  }

  if (mediaTypeObject.example !== undefined) {
    return [{ name: null, summary: null, value: mediaTypeObject.example }];
  }

  return [];
}

function buildRequests(spec: RawSpec, requestBody: RawOperation["requestBody"]): Contract[] {
  if (!requestBody) return [];

  const resolved = requestBody.$ref
    ? (resolveRef<RawRequestBody>(spec, requestBody.$ref, "requestBodies") ?? requestBody)
    : requestBody;

  const content = resolved.content ?? {};
  const title = resolved.description ?? null;

  return Object.entries(content).map(([mediaType, mediaTypeObject]) => ({
    role: "request" as const,
    status: null,
    mediaType,
    schema: mediaTypeObject?.schema ?? null,
    title,
    examples: buildExamples(spec, mediaTypeObject),
    headers: [],
    required: Boolean(resolved.required),
  }));
}

function buildResponses(spec: RawSpec, responses: RawOperation["responses"]): Contract[] {
  if (!responses) return [];

  const contracts: Contract[] = [];

  for (const [status, response] of Object.entries(responses)) {
    const resolved = response.$ref
      ? (resolveRef<NonNullable<typeof response>>(spec, response.$ref, "responses") ?? response)
      : response;

    const title = resolved.description ?? null;
    const content = resolved.content ?? {};
    const mediaTypes = Object.entries(content);
    const headers = buildResponseHeaders(spec, resolved.headers);

    if (mediaTypes.length === 0) {
      contracts.push({
        role: "response",
        status,
        mediaType: null,
        schema: null,
        title,
        examples: [],
        headers,
        required: false,
      });
      continue;
    }

    for (const [mediaType, mediaTypeObject] of mediaTypes) {
      contracts.push({
        role: "response",
        status,
        mediaType,
        schema: mediaTypeObject?.schema ?? null,
        title,
        examples: buildExamples(spec, mediaTypeObject),
        headers,
        required: false,
      });
    }
  }

  return contracts;
}

function buildSecurity(spec: RawSpec, operation: RawOperation): SecurityRequirement[] {
  const raw = operation.security !== undefined ? operation.security : (spec.security ?? []);

  return raw.map((requirement) => ({
    schemes: Object.entries(requirement).map(([name, scopes]) => {
      const definition = resolveSecurityScheme(spec, name);

      return {
        name,
        scopes: scopes ?? [],
        type: definition?.type ?? null,
        scheme: definition?.scheme ?? null,
      };
    }),
  }));
}

function resolveSecurityScheme(spec: RawSpec, name: string): RawSecurityScheme | null {
  const definition = spec.components?.securitySchemes?.[name] ?? null;

  return definition?.$ref
    ? (resolveRef<RawSecurityScheme>(spec, definition.$ref, "securitySchemes") ?? definition)
    : definition;
}

export function filterNavigationByTags(nav: Navigation, tags: string[]): Navigation {
  const set = new Set(tags);
  const groups = nav.groups.filter((g) => set.has(g.title));
  const keep = new Set(groups.flatMap((g) => g.operationIds));
  const summaries = Object.fromEntries(
    Object.entries(nav.summaries).filter(([id]) => keep.has(id)),
  );

  return { ...nav, groups, summaries };
}

export function parseOperation(
  input: unknown,
  opId: string,
  selectedServerUrl: string | null = null,
): Operation | null {
  const spec = asRawSpec(input);
  const found = findOperation(spec, opId);
  if (!found) return null;

  const { path, method, pathItem, operation } = found;
  const operationServers = normalizeServers(operation.servers);
  const pathServers = normalizeServers(pathItem.servers);
  const usesRootServers = operationServers.length === 0 && pathServers.length === 0;
  const servers =
    operationServers.length > 0
      ? operationServers
      : pathServers.length > 0
        ? pathServers
        : buildServers(spec);
  const effectiveServerUrl =
    usesRootServers && selectedServerUrl !== null
      ? selectedServerUrl
      : selectedServerUrl !== null && servers.some((server) => server.url === selectedServerUrl)
        ? selectedServerUrl
        : servers[0]!.url;

  const summary: OperationSummary = {
    id: opId,
    method: method.toUpperCase(),
    path,
    title: operationTitle(operation, method, path),
    deprecated: Boolean(operation.deprecated),
  };

  return {
    summary,
    serverUrl: effectiveServerUrl,
    servers,
    usesRootServers,
    description: operation.description ?? null,
    tooltip: operation["x-tooltip"] ?? null,
    tags: operation.tags ?? [],
    paramGroups: buildParamGroups(spec, pathItem.parameters ?? [], operation.parameters ?? []),
    requests: buildRequests(spec, operation.requestBody),
    responses: buildResponses(spec, operation.responses),
    security: buildSecurity(spec, operation),
  };
}

function asRawSpec(input: unknown): RawSpec {
  return typeof input === "object" && input !== null ? (input as RawSpec) : {};
}

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ApiError,
  invalidateRemoteToken,
  remoteToken,
  type RemoteAccess,
} from "@lattice-php/core/api";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { Badge } from "@lattice-php/ui/badge";
import { Button } from "@lattice-php/ui/button";
import { Combobox } from "@lattice-php/ui/combobox";
import { CodeBlock } from "@lattice-php/ui/components/code-block";
import { CopyButton } from "@lattice-php/ui/copyable-text";
import { InfoTooltip } from "@lattice-php/ui/info-tooltip";
import { Input } from "@lattice-php/ui/input";
import { NativeSelect } from "@lattice-php/ui/native-select";
import { SegmentedPills } from "@lattice-php/ui/segmented-pills";
import { Spinner } from "@lattice-php/ui/spinner";
import { SchemaView } from "../schema/SchemaView";
import {
  cachedAccessTokens,
  type AccessTokenRequest,
  type ResolveAccessToken,
} from "./access-token";
import { executeRequest, type ExecutedResponse, type ExecutionError } from "./execute-request";
import { LiveResponsePanel, responseBadgeColor } from "./LiveResponsePanel";
import { OperationHeader } from "./OperationHeader";
import { operationToMarkdown } from "./operation-markdown";
import { parameterAllowedValues, parameterTypeLabel } from "./parameter-schema";
import { RequestBodyEditor } from "./RequestBodyEditor";
import {
  buildRequest,
  isBearerAccessTokenScheme,
  operationTokenScopes,
  parameterLimitation,
  redactAuthorization,
  type RequestErrors,
} from "./request-builder";
import {
  initialRequestValues,
  jsonRequestContracts,
  parameterKey,
  type RequestValues,
} from "./request-state";
import { SnippetPanel, type SnippetLanguage } from "./SnippetPanel";
import { exampleFromSchema, initialRequestExample } from "./schema-example";
import { curlSnippet } from "./snippets/curl";
import { javascriptSnippet } from "./snippets/javascript";
import { contractLabel, isAbortError, isRecord, prettyJson } from "./utils";
import type {
  Contract,
  ContractExample,
  Operation,
  Param,
  ParamGroup,
  SecurityRequirement,
  SecuritySchemeRef,
} from "./types";

type OAuthFlowDefinition = {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes?: Record<string, string>;
};

type SecuritySchemeDefinition = {
  type?: string;
  scheme?: string;
  bearerFormat?: string;
  in?: string;
  name?: string;
  description?: string | null;
  openIdConnectUrl?: string;
  flows?: Record<string, OAuthFlowDefinition>;
};

export type TwoColumnBreakpoint = "default" | "sm" | "md" | "lg" | "xl" | "2xl";

const TWO_COLUMN_LAYOUTS: Record<TwoColumnBreakpoint, { grid: string; reference: string }> = {
  default: {
    grid: "grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
    reference: "sticky top-0 border-l border-t-0",
  },
  sm: {
    grid: "sm:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
    reference: "sm:sticky sm:top-0 sm:border-l sm:border-t-0",
  },
  md: {
    grid: "md:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
    reference: "md:sticky md:top-0 md:border-l md:border-t-0",
  },
  lg: {
    grid: "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
    reference: "lg:sticky lg:top-0 lg:border-l lg:border-t-0",
  },
  xl: {
    grid: "xl:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
    reference: "xl:sticky xl:top-0 xl:border-l xl:border-t-0",
  },
  "2xl": {
    grid: "2xl:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)]",
    reference: "2xl:sticky 2xl:top-0 2xl:border-l 2xl:border-t-0",
  },
};

function ParamRow({
  param,
  control,
}: {
  param: Param;
  control?: React.ReactNode;
}): React.ReactNode {
  const allowedValues = parameterAllowedValues(param.schema);
  const rowLayout = control
    ? "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 py-3 sm:grid-cols-[minmax(0,3fr)_minmax(12rem,2fr)] sm:items-start"
    : "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 py-2";
  const hasDetails = Boolean(param.description) || allowedValues.length > 0;

  return (
    <li className={`border-b border-lt-border last:border-b-0 ${rowLayout}`}>
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 break-words font-mono text-lt-fg">{param.name}</span>
        {param.required ? <span className="text-lt-danger">*</span> : null}
        {param.deprecated ? <Badge color="danger">deprecated</Badge> : null}
        <InfoTooltip content={param.tooltip} />
      </div>
      <span className="col-start-2 row-start-1 justify-self-end rounded-lt-xs bg-lt-muted px-2 py-1 text-xs text-lt-muted-fg">
        {parameterTypeLabel(param.schema)}
      </span>
      {hasDetails ? (
        <div
          className={`col-span-2 min-w-0${control ? " sm:col-span-1 sm:col-start-1 sm:row-start-2" : ""}`}
        >
          {param.description ? (
            <p className="mt-0.5 text-xs text-lt-muted-fg">{param.description}</p>
          ) : null}
          {allowedValues.length > 0 ? (
            <p className="mt-0.5 text-xs text-lt-muted-fg">
              Available values: {allowedValues.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
      {control ? (
        <div className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-2">
          {control}
        </div>
      ) : null}
    </li>
  );
}

function ParamGroupSection({
  group,
  idPrefix,
  values,
  errors,
  onChange,
}: {
  group: ParamGroup;
  idPrefix: string;
  values: RequestValues;
  errors: Record<string, string>;
  onChange: (param: Param, value: string) => void;
}): React.ReactNode {
  const isInline = group.location === "path" || group.location === "query";

  return (
    <div className="mb-4">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg">
        {group.location} parameters
      </h3>
      <ul>
        {group.params.map((param) => (
          <ParamRow
            key={`${param.location}-${param.name}`}
            param={param}
            control={
              isInline && isRenderableParameter(group.location, param) ? (
                <RequestParameterField
                  inline
                  idPrefix={idPrefix}
                  param={param}
                  value={values.parameters[parameterKey(param)] ?? ""}
                  error={errors[parameterKey(param)] ?? null}
                  onChange={(value) => onChange(param, value)}
                />
              ) : undefined
            }
          />
        ))}
      </ul>
    </div>
  );
}

type GroupedQueryParameters = {
  label: "Filter" | "Sort" | "Include";
  params: Param[];
};

function groupedQueryParameters(operation: Operation): GroupedQueryParameters[] {
  const parameters = operation.paramGroups
    .flatMap((group) => group.params)
    .filter((param) => param.location === "query");

  return [
    { label: "Filter", params: parameters.filter((param) => /^filter\[.+\]$/.test(param.name)) },
    { label: "Sort", params: parameters.filter((param) => param.name === "sort") },
    { label: "Include", params: parameters.filter((param) => param.name === "include") },
  ].filter((group) => group.params.length > 0) as GroupedQueryParameters[];
}

function GroupedQueryParameterSection({
  group,
  idPrefix,
  values,
  errors,
  onChange,
}: {
  group: GroupedQueryParameters;
  idPrefix: string;
  values: RequestValues;
  errors: Record<string, string>;
  onChange: (param: Param, value: string) => void;
}): React.ReactNode {
  return (
    <fieldset className="mb-4 rounded-lt-sm border border-lt-border p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg">
        {group.label}
      </legend>
      <div className="flex flex-wrap items-start gap-4">
        {group.params.map((param) => (
          <RequestParameterField
            key={parameterKey(param)}
            idPrefix={idPrefix}
            param={param}
            value={values.parameters[parameterKey(param)] ?? ""}
            error={errors[parameterKey(param)] ?? null}
            onChange={(value) => onChange(param, value)}
          />
        ))}
      </div>
    </fieldset>
  );
}

type PaginationParameters = {
  mode: Param | null;
  page: Param | null;
  cursor: Param | null;
  perPage: Param | null;
};

function paginationParameters(operation: Operation): PaginationParameters | null {
  const parameters = operation.paramGroups.flatMap((group) => group.params);
  const mode =
    parameters.find(
      (param) => param.location === "header" && param.name.toLowerCase() === "x-pagination",
    ) ?? null;

  const queryParameter = (name: string): Param | null =>
    parameters.find((param) => param.location === "query" && param.name === name) ?? null;
  const page = queryParameter("page");
  const cursor = queryParameter("cursor");
  const perPage = queryParameter("per_page");

  return perPage === null || (page === null && cursor === null)
    ? null
    : { mode, page, cursor, perPage };
}

function PaginationParameterSection({
  parameters,
  idPrefix,
  values,
  errors,
  onModeChange,
  onChange,
}: {
  parameters: PaginationParameters;
  idPrefix: string;
  values: RequestValues;
  errors: Record<string, string>;
  onModeChange: (value: string) => void;
  onChange: (param: Param, value: string) => void;
}): React.ReactNode {
  const usesCursor =
    parameters.mode === null
      ? parameters.page === null
      : values.parameters[parameterKey(parameters.mode)] === "cursor";
  const activeParameters = usesCursor
    ? [parameters.cursor, parameters.perPage]
    : [parameters.page, parameters.perPage];

  return (
    <fieldset className="mb-4 rounded-lt-sm border border-lt-border p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg">
        Pagination
      </legend>
      <div className="flex flex-col gap-3">
        {parameters.mode === null ? null : (
          <div className="flex flex-wrap items-start gap-4">
            <RequestParameterField
              idPrefix={idPrefix}
              param={parameters.mode}
              value={values.parameters[parameterKey(parameters.mode)] ?? ""}
              error={errors[parameterKey(parameters.mode)] ?? null}
              onChange={onModeChange}
            />
          </div>
        )}
        <div className="flex flex-wrap items-start gap-4">
          {activeParameters.map((param) =>
            param === null ? null : (
              <RequestParameterField
                key={parameterKey(param)}
                idPrefix={idPrefix}
                param={param}
                value={values.parameters[parameterKey(param)] ?? ""}
                error={errors[parameterKey(param)] ?? null}
                onChange={(value) => onChange(param, value)}
              />
            ),
          )}
        </div>
      </div>
    </fieldset>
  );
}

type SchemaTab = "schema" | "example";

const SCHEMA_TABS: Array<{ key: SchemaTab; label: string }> = [
  { key: "schema", label: "Schema" },
  { key: "example", label: "Example" },
];

function SchemaExampleView({
  name,
  schema,
  examples,
  components,
  noSchemaMessage,
  expandDepth,
  exampleLabel,
  maxHeight = 2400,
  defaultTab = "schema",
  generateExample = false,
}: {
  name: string;
  schema: unknown;
  examples: ContractExample[];
  components: unknown;
  noSchemaMessage: string;
  expandDepth: number;
  exampleLabel: string;
  maxHeight?: number;
  defaultTab?: SchemaTab;
  generateExample?: boolean;
}): React.ReactNode {
  const [tab, setTab] = useState<SchemaTab>(defaultTab);
  const [selected, setSelected] = useState(0);
  const displayedExamples = useMemo<ContractExample[]>(
    () =>
      examples.length > 0 || !generateExample
        ? examples
        : [
            {
              name: null,
              summary: null,
              description: null,
              value: exampleFromSchema(schema, components),
            },
          ],
    [components, examples, generateExample, schema],
  );
  const isGenerated = generateExample && examples.length === 0;

  if (displayedExamples.length === 0) {
    return <SchemaView schema={schema} components={components} expandDepth={expandDepth} />;
  }

  const current = displayedExamples[selected] ?? displayedExamples[0];

  return (
    <div>
      <div className="mb-2 pb-2">
        <SegmentedPills
          name={name}
          ariaLabel="Schema or example"
          options={SCHEMA_TABS.map(({ key, label }) => ({ label, value: key, data: null }))}
          value={tab}
          onSelect={(value) => setTab(value as SchemaTab)}
        />
      </div>
      {tab === "schema" ? (
        schema ? (
          <SchemaView schema={schema} components={components} expandDepth={expandDepth} />
        ) : (
          <p className="text-lt-muted-fg">{noSchemaMessage}</p>
        )
      ) : (
        <div>
          {displayedExamples.length > 1 ? (
            <NativeSelect
              aria-label={`${exampleLabel} selection`}
              value={selected}
              onChange={(event) => setSelected(Number(event.target.value))}
              className="mb-2"
            >
              {displayedExamples.map((example, index) => (
                <option key={example.name ?? index} value={index}>
                  {example.name ?? `Example ${index + 1}`}
                  {example.summary ? ` — ${example.summary}` : ""}
                </option>
              ))}
            </NativeSelect>
          ) : current?.summary ? (
            <p className="mb-1 text-xs text-lt-muted-fg">{current.summary}</p>
          ) : null}
          {isGenerated ? (
            <p className="mb-1 text-xs text-lt-muted-fg">Generated from schema</p>
          ) : null}
          {current?.description ? (
            <p className="mb-1 text-xs text-lt-muted-fg">{current.description}</p>
          ) : null}
          {current?.externalValue ? (
            <a
              href={current.externalValue}
              target="_blank"
              rel="noreferrer"
              className="mb-2 block text-xs text-lt-primary underline underline-offset-2"
            >
              Open external example
            </a>
          ) : null}
          {current?.value !== undefined ? (
            <CodeBlock
              aria-label={exampleLabel}
              copyable
              language="json"
              lineNumbers
              maxHeight={maxHeight}
            >
              {JSON.stringify(current.value, null, 2)}
            </CodeBlock>
          ) : null}
        </div>
      )}
    </div>
  );
}

function RequestBodySection({
  requests,
  components,
  expandDepth,
}: {
  requests: Contract[];
  components: unknown;
  expandDepth: number;
}): React.ReactNode {
  if (requests.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-2 font-semibold text-lt-fg">Request body</h2>
      {requests.map((request, index) => (
        <div key={`${request.mediaType ?? "none"}-${index}`} className="mb-4">
          <p className="mb-1 font-mono text-xs text-lt-muted-fg">
            {request.mediaType ?? "unspecified media type"}
            {request.title ? ` — ${request.title}` : ""}
          </p>
          {request.schema || request.examples.length > 0 ? (
            <SchemaExampleView
              name={`request-${request.mediaType ?? "none"}-${index}-tab`}
              schema={request.schema}
              examples={request.examples}
              components={components}
              noSchemaMessage="No request body schema."
              expandDepth={expandDepth}
              exampleLabel="Request body example"
            />
          ) : (
            <p className="text-lt-muted-fg">No request body schema.</p>
          )}
        </div>
      ))}
    </section>
  );
}

function ResponsesSection({
  responses,
  components,
  expandDepth,
}: {
  responses: Contract[];
  components: unknown;
  expandDepth: number;
}): React.ReactNode {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  if (responses.length === 0) return null;

  const orderedResponses = [...responses].sort(compareResponses);
  const current =
    orderedResponses.find((response) => contractLabel(response) === activeLabel) ??
    orderedResponses[0];
  const responseLabels = orderedResponses.map(contractLabel);

  return (
    <section>
      <h2 className="mb-2 font-semibold text-lt-fg">Responses</h2>
      <div className="mb-3 flex items-center gap-2 pb-2">
        <NativeSelect
          aria-label="Response status"
          value={activeLabel ?? responseLabels[0] ?? ""}
          onChange={(event) => setActiveLabel(event.target.value)}
        >
          {responseLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </NativeSelect>
        {current ? (
          <Badge color={responseBadgeColor(current.status)}>{current.status ?? "default"}</Badge>
        ) : null}
      </div>
      {current ? (
        <div>
          {current.title ? <p className="mb-2 text-lt-muted-fg">{current.title}</p> : null}
          {current.headers.length > 0 ? (
            <div className="mb-4">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg">
                Response headers
              </h3>
              <ul>
                {current.headers.map((header) => (
                  <ParamRow key={header.name} param={header} />
                ))}
              </ul>
            </div>
          ) : null}
          {current.schema || current.examples.length > 0 ? (
            <SchemaExampleView
              key={contractLabel(current)}
              name={`response-${contractLabel(current)}-tab`}
              schema={current.schema}
              examples={current.examples}
              components={components}
              noSchemaMessage="No response body."
              expandDepth={expandDepth}
              exampleLabel="Response example"
              maxHeight={800}
              defaultTab="example"
              generateExample
            />
          ) : (
            <p className="text-lt-muted-fg">No response body.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}

function compareResponses(left: Contract, right: Contract): number {
  const leftStatus = left.status ?? "default";
  const rightStatus = right.status ?? "default";
  const rankDifference = responseRank(leftStatus) - responseRank(rightStatus);

  return rankDifference !== 0 || leftStatus === rightStatus
    ? rankDifference
    : leftStatus.localeCompare(rightStatus, undefined, { numeric: true });
}

function responseRank(status: string): number {
  return ({ "2": 0, "3": 1, "4": 2, "5": 3 } as const)[status[0]] ?? 4;
}

function securitySchemeLabel(name: string, definition: SecuritySchemeDefinition | null): string {
  if (!definition) return name;

  if (definition.type === "http" && definition.scheme === "bearer") {
    return definition.bearerFormat ? `HTTP Bearer (${definition.bearerFormat})` : "HTTP Bearer";
  }
  if (definition.type === "http" && definition.scheme === "basic") {
    return "HTTP Basic";
  }
  if (definition.type === "apiKey") {
    return `API key (${definition.in}: ${definition.name})`;
  }
  if (definition.type === "oauth2") {
    return "OAuth 2.0";
  }
  if (definition.type === "openIdConnect") {
    return "OpenID Connect";
  }

  return name;
}

function accessTokenDescription(authMode: PlaygroundAuthMode): string {
  switch (authMode) {
    case "lazy":
      return "A scoped access token is fetched automatically when you execute a request. If that fails, sign in again.";
    case "static":
      return "Access token supplied by the host page.";
    case "none":
      return "No access token is configured for live requests.";
  }
}

function SecuritySchemeRow({
  scheme,
  components,
  authMode,
}: {
  scheme: SecuritySchemeRef;
  components: unknown;
  authMode: PlaygroundAuthMode;
}): React.ReactNode {
  const definitions =
    (components as { securitySchemes?: Record<string, SecuritySchemeDefinition> } | null)
      ?.securitySchemes ?? {};
  const definition = definitions[scheme.name] ?? null;
  const descriptions = scopeDescriptions(definition);

  return (
    <li className="border-b border-lt-border py-2 last:border-b-0">
      <span className="text-lt-fg">{securitySchemeLabel(scheme.name, definition)}</span>
      {definition?.description ? (
        <p className="mt-0.5 text-xs text-lt-muted-fg">{definition.description}</p>
      ) : null}
      <p className="mt-0.5 text-xs text-lt-muted-fg">
        {isBearerAccessTokenScheme(scheme)
          ? accessTokenDescription(authMode)
          : "This authentication scheme is not supported for live requests."}
      </p>
      <OAuthFlowList flows={definition?.flows} />
      {scheme.scopes.length > 0 ? (
        <ul className="mt-1 flex flex-col gap-1">
          {scheme.scopes.map((scope) => (
            <li key={scope} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
              <code className="rounded-lt-xs bg-lt-muted px-1.5 py-0.5 text-lt-muted-fg">
                {scope}
              </code>
              {descriptions[scope] ? (
                <span className="text-lt-muted-fg">{descriptions[scope]}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * A scope means the same thing in every flow that offers it, so the descriptions are
 * read as one catalog rather than per flow.
 */
function scopeDescriptions(definition: SecuritySchemeDefinition | null): Record<string, string> {
  return Object.values(definition?.flows ?? {}).reduce<Record<string, string>>(
    (descriptions, flow) => ({ ...descriptions, ...flow.scopes }),
    {},
  );
}

const OAUTH_FLOW_URLS: Array<{
  key: "authorizationUrl" | "tokenUrl" | "refreshUrl";
  label: string;
}> = [
  { key: "authorizationUrl", label: "Authorize" },
  { key: "tokenUrl", label: "Token" },
  { key: "refreshUrl", label: "Refresh" },
];

function OAuthFlowList({
  flows,
}: {
  flows: Record<string, OAuthFlowDefinition> | undefined;
}): React.ReactNode {
  const entries = Object.entries(flows ?? {});

  if (entries.length === 0) return null;

  return (
    <dl className="mt-1 flex flex-col gap-0.5 text-xs text-lt-muted-fg">
      {entries.map(([flow, definition]) => (
        <div key={flow} className="flex flex-wrap items-baseline gap-x-2">
          <dt className="font-medium">{flow}</dt>
          {OAUTH_FLOW_URLS.map(({ key, label }) => {
            const url = definition[key];

            return typeof url === "string" && url !== "" ? (
              <dd key={key} className="min-w-0 break-all">
                {label}: <span className="font-mono">{url}</span>
              </dd>
            ) : null;
          })}
        </div>
      ))}
    </dl>
  );
}

function SecurityRequirementRow({
  requirement,
  components,
  authMode,
}: {
  requirement: SecurityRequirement;
  components: unknown;
  authMode: PlaygroundAuthMode;
}): React.ReactNode {
  if (requirement.schemes.length === 0) {
    return <p className="text-lt-muted-fg">Optional authentication</p>;
  }

  return (
    <ul>
      {requirement.schemes.map((scheme) => (
        <SecuritySchemeRow
          key={scheme.name}
          scheme={scheme}
          components={components}
          authMode={authMode}
        />
      ))}
    </ul>
  );
}

function SecuritySection({
  security,
  components,
  authMode,
}: {
  security: SecurityRequirement[];
  components: unknown;
  authMode: PlaygroundAuthMode;
}): React.ReactNode {
  if (security.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-2 font-semibold text-lt-fg">Authorization</h2>
      {security.map((requirement, index) => (
        <div key={index}>
          {index > 0 ? (
            <p className="my-2 text-xs font-semibold uppercase tracking-wide text-lt-muted-fg">
              OR
            </p>
          ) : null}
          <SecurityRequirementRow
            requirement={requirement}
            components={components}
            authMode={authMode}
          />
        </div>
      ))}
    </section>
  );
}

type RequestPlaygroundProps = {
  operation: Operation;
  baseUrl: string | null;
  token: string | null;
  remoteTokens?: RemoteAccess[] | null;
  resolveAccessToken?: ResolveAccessToken | null;
  components: unknown;
  expandDepth?: number;
  twoColumnBreakpoint?: TwoColumnBreakpoint;
  hideHeaderIdentity?: boolean;
};

export type PlaygroundAuthMode = "lazy" | "static" | "none";

const REDACTED_TOKEN = "<YOUR_TOKEN>";

function remoteAccessForScopes(
  remoteTokens: RemoteAccess[] | null,
  scopes: string[] | null,
): RemoteAccess | null {
  if (remoteTokens === null || scopes === null) {
    return null;
  }

  const key = scopes.join(" ");

  return (
    remoteTokens.find((remote) => [...new Set(remote.scopes)].sort().join(" ") === key) ?? null
  );
}

async function accessTokenErrorMessage(error: unknown): Promise<string> {
  if (error instanceof ApiError) {
    try {
      const data: unknown = await error.response.clone().json();

      if (isRecord(data) && typeof data.message === "string" && data.message !== "") {
        return data.message;
      }
    } catch {
      // Fall through to the generic message.
    }

    return `Fetching an access token failed (HTTP ${error.response.status}). Sign in again and retry.`;
  }

  if (error instanceof Error && error.message !== "") {
    return error.message;
  }

  return "Fetching an access token failed. Check your session and try again.";
}

export function RequestPlayground({
  operation,
  baseUrl,
  token,
  remoteTokens = null,
  resolveAccessToken = null,
  components,
  expandDepth = 2,
  twoColumnBreakpoint = "lg",
  hideHeaderIdentity = false,
}: RequestPlaygroundProps): React.ReactNode {
  const idPrefix = `${operation.summary.id}-${useId().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`;
  const playgroundRef = useRef<HTMLElement>(null);
  const activeControllerRef = useRef<AbortController | null>(null);
  const [values, setValues] = useState<RequestValues>(() =>
    initialPlaygroundValues(operation, components),
  );
  const [snippetLanguage, setSnippetLanguage] = useState<SnippetLanguage>("curl");
  const [isLoading, setIsLoading] = useState(false);
  const [liveResult, setLiveResult] = useState<ExecutedResponse | ExecutionError | null>(null);
  const queryParameterGroups = groupedQueryParameters(operation);
  const pagination = paginationParameters(operation);
  const groupedParameterKeys = new Set([
    ...queryParameterGroups.flatMap((group) => group.params).map(parameterKey),
    ...(pagination === null
      ? []
      : [pagination.mode, pagination.page, pagination.cursor, pagination.perPage]
          .filter((param): param is Param => param !== null)
          .map(parameterKey)),
  ]);
  const parameterGroups = operation.paramGroups
    .map((group) => ({
      ...group,
      params: group.params.filter((param) => !groupedParameterKeys.has(parameterKey(param))),
    }))
    .filter((group) => group.params.length > 0);
  const jsonContracts = jsonRequestContracts(operation);
  const selectedContract =
    jsonContracts.find((contract) => contract.mediaType === values.mediaType) ?? null;
  const tokenScopes = useMemo(() => operationTokenScopes(operation), [operation]);
  const remoteAccess = useMemo(
    () => remoteAccessForScopes(remoteTokens, tokenScopes),
    [remoteTokens, tokenScopes],
  );
  // The host's callback may be a new function every render; route it through a
  // ref so the cache wrapper (and its per-scope-set entries) survives renders.
  const latestResolveAccessToken = useRef(resolveAccessToken);
  useEffect(() => {
    latestResolveAccessToken.current = resolveAccessToken;
  });
  const [callbackResolver] = useState(() =>
    cachedAccessTokens((request) => {
      const resolve = latestResolveAccessToken.current;

      if (resolve === null) {
        throw new Error("No access token resolver is configured.");
      }

      return resolve(request);
    }),
  );
  const tokenResolver = useMemo(() => {
    if (resolveAccessToken !== null && tokenScopes !== null) {
      return callbackResolver;
    }

    if (remoteAccess !== null) {
      return async ({ forceRefresh }: AccessTokenRequest): Promise<string> => {
        if (forceRefresh) {
          invalidateRemoteToken(remoteAccess);
        }

        return (await remoteToken(remoteAccess)).accessToken;
      };
    }

    return null;
  }, [resolveAccessToken, tokenScopes, callbackResolver, remoteAccess]);
  const authMode: PlaygroundAuthMode =
    tokenResolver !== null ? "lazy" : token !== null && token !== "" ? "static" : "none";
  const previewToken = authMode === "lazy" ? REDACTED_TOKEN : token;
  const buildResult = useMemo(
    () => buildRequest({ operation, baseUrl, values, token: previewToken }),
    [operation, baseUrl, values, previewToken],
  );
  const nonInteractiveParameterLimitations = parameterLimitationsWithoutControls(operation);
  const hasUnsupportedRequestBody = operation.requests.length > 0 && jsonContracts.length === 0;
  const requestBodyRequired = selectedContract?.required ?? false;
  const twoColumnLayout = TWO_COLUMN_LAYOUTS[twoColumnBreakpoint];
  const snippet = useMemo(() => {
    if (buildResult.request === null) {
      return "";
    }

    const request = redactAuthorization(buildResult.request);

    return snippetLanguage === "curl"
      ? curlSnippet.generate(request)
      : javascriptSnippet.generate(request);
  }, [buildResult, snippetLanguage]);
  const markdown = useMemo(
    () => operationToMarkdown(operation, components),
    [operation, components],
  );

  useEffect(() => {
    return () => {
      const controller = activeControllerRef.current;
      activeControllerRef.current = null;
      controller?.abort();
    };
  }, []);

  function updateParameter(param: Param, value: string): void {
    const key = parameterKey(param);

    setValues((current) => ({
      ...current,
      parameters: { ...current.parameters, [key]: value },
    }));
  }

  function updatePaginationMode(value: string): void {
    if (pagination === null || pagination.mode === null) {
      return;
    }

    const mode = pagination.mode;

    setValues((current) => {
      const parameters = {
        ...current.parameters,
        [parameterKey(mode)]: value,
      };

      if (value === "cursor" && pagination.page !== null) {
        parameters[parameterKey(pagination.page)] = "";
      } else if (pagination.cursor !== null) {
        parameters[parameterKey(pagination.cursor)] = "";
      }

      return { ...current, parameters };
    });
  }

  function updateBody(body: string): void {
    setValues((current) => ({ ...current, body }));
  }

  function updateMediaType(mediaType: string): void {
    const contract = jsonContracts.find((candidate) => candidate.mediaType === mediaType);

    setValues((current) => ({
      ...current,
      mediaType,
      body: contract === undefined ? "" : prettyJson(initialRequestExample(contract, components)),
    }));
  }

  async function tryRequest(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (hasUnsupportedRequestBody) {
      return;
    }

    const validation = buildRequest({ operation, baseUrl, values, token: previewToken });

    if (validation.errors !== null) {
      const fieldKey = firstErrorFieldKey(operation, validation.errors);
      const fields = playgroundRef.current?.querySelectorAll<HTMLElement>("[data-field-key]") ?? [];

      Array.from(fields)
        .find((field) => field.dataset.fieldKey === fieldKey)
        ?.focus();

      return;
    }

    activeControllerRef.current?.abort();
    const controller = new AbortController();
    activeControllerRef.current = controller;
    setIsLoading(true);

    try {
      let executionToken = token;

      if (tokenResolver !== null && tokenScopes !== null) {
        try {
          executionToken = await tokenResolver({ scopes: tokenScopes, forceRefresh: false });
        } catch (error: unknown) {
          const message = await accessTokenErrorMessage(error);

          if (activeControllerRef.current === controller) {
            setLiveResult({ kind: "error", message });
          }

          return;
        }
      }

      const result = buildRequest({ operation, baseUrl, values, token: executionToken });

      if (result.errors !== null) {
        return;
      }

      let nextResult = await executeRequest(result.request, controller.signal);

      if (
        tokenResolver !== null &&
        tokenScopes !== null &&
        nextResult.kind === "response" &&
        nextResult.status === 401
      ) {
        try {
          const refreshed = buildRequest({
            operation,
            baseUrl,
            values,
            token: await tokenResolver({ scopes: tokenScopes, forceRefresh: true }),
          });

          if (refreshed.errors === null) {
            nextResult = await executeRequest(refreshed.request, controller.signal);
          }
        } catch (error: unknown) {
          if (isAbortError(error)) {
            throw error;
          }
          // Keep the original 401 response when the token refresh fails too.
        }
      }

      if (activeControllerRef.current === controller) {
        setLiveResult(nextResult);
      }
    } catch (error: unknown) {
      if (!isAbortError(error)) {
        throw error;
      }
    } finally {
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
        setIsLoading(false);
      }
    }
  }

  return (
    <div className={`grid min-w-0 items-start text-base ${twoColumnLayout.grid}`}>
      <aside ref={playgroundRef} aria-label="Request" className="min-w-0 p-6">
        <OperationHeader
          operation={operation}
          baseUrl={baseUrl}
          hideIdentity={hideHeaderIdentity}
        />
        <SecuritySection
          security={operation.security}
          components={components}
          authMode={authMode}
        />
        {parameterGroups.length > 0 || queryParameterGroups.length > 0 || pagination !== null ? (
          <section className="mb-6">
            <h2 className="mb-2 font-semibold text-lt-fg">Parameters</h2>
            {queryParameterGroups.map((group) => (
              <GroupedQueryParameterSection
                key={group.label}
                group={group}
                idPrefix={idPrefix}
                values={values}
                errors={buildResult.errors?.parameters ?? {}}
                onChange={updateParameter}
              />
            ))}
            {pagination !== null ? (
              <PaginationParameterSection
                parameters={pagination}
                idPrefix={idPrefix}
                values={values}
                errors={buildResult.errors?.parameters ?? {}}
                onModeChange={updatePaginationMode}
                onChange={updateParameter}
              />
            ) : null}
            {parameterGroups.map((group) => (
              <ParamGroupSection
                key={group.location}
                group={group}
                idPrefix={idPrefix}
                values={values}
                errors={buildResult.errors?.parameters ?? {}}
                onChange={updateParameter}
              />
            ))}
          </section>
        ) : null}
        <div className="flex flex-col gap-6">
          {parameterGroups
            .filter((group) => !isInlineParameterGroup(group.location))
            .map((group) => {
              const supportedParams = group.params.filter((param) =>
                isRenderableParameter(group.location, param),
              );

              if (supportedParams.length === 0) {
                return null;
              }

              return (
                <section key={group.location} className="flex flex-col gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-lt-muted-fg">
                    {group.location} parameters
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {supportedParams.map((param) => (
                      <RequestParameterField
                        key={parameterKey(param)}
                        idPrefix={idPrefix}
                        param={param}
                        value={values.parameters[parameterKey(param)] ?? ""}
                        error={buildResult.errors?.parameters[parameterKey(param)] ?? null}
                        onChange={(value) => updateParameter(param, value)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

          {nonInteractiveParameterLimitations.length > 0 || hasUnsupportedRequestBody ? (
            <section aria-live="polite" className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-lt-muted-fg">
                Request limitations
              </h3>
              <ul className="flex flex-col gap-1 text-xs text-lt-danger">
                {nonInteractiveParameterLimitations.map(({ key, name, message }) => (
                  <li key={key}>
                    {name}: {message}
                  </li>
                ))}
                {hasUnsupportedRequestBody ? (
                  <li>Only JSON request bodies can be sent from the playground.</li>
                ) : null}
              </ul>
            </section>
          ) : null}

          {jsonContracts.length > 0 ? (
            <section className="flex flex-col gap-3">
              {jsonContracts.length > 1 ? (
                <FormFieldFrame
                  id={`${idPrefix}-request-media-type`}
                  label="Content type"
                  className="min-w-0 basis-full flex-1 sm:basis-48"
                >
                  {(controlProps) => (
                    <NativeSelect
                      {...controlProps}
                      value={values.mediaType ?? ""}
                      onChange={(event) => updateMediaType(event.target.value)}
                    >
                      {jsonContracts.map((contract) => (
                        <option key={contract.mediaType} value={contract.mediaType ?? ""}>
                          {contract.mediaType}
                        </option>
                      ))}
                    </NativeSelect>
                  )}
                </FormFieldFrame>
              ) : null}
              {selectedContract !== null ? (
                <RequestBodyEditor
                  idPrefix={idPrefix}
                  schema={selectedContract.schema}
                  components={components}
                  value={values.body}
                  required={requestBodyRequired}
                  error={buildResult.errors?.body ?? undefined}
                  onChange={updateBody}
                />
              ) : null}
            </section>
          ) : null}

          {buildResult.errors?.request ? (
            <p className="text-lt-danger">{buildResult.errors.request}</p>
          ) : null}

          <form onSubmit={tryRequest} className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isLoading || hasUnsupportedRequestBody}>
              {isLoading ? <Spinner className="size-lt-icon-sm" /> : null}
              Execute
            </Button>
            {!hideHeaderIdentity ? (
              <CopyButton
                value={markdown}
                label="as Markdown"
                testId="copy-operation-markdown"
                className="ml-auto"
              >
                Copy as Markdown
              </CopyButton>
            ) : null}
          </form>

          <LiveResponsePanel result={liveResult} />
        </div>
      </aside>
      <aside
        aria-label="Reference"
        className={`min-w-0 border-t border-lt-border p-6 ${twoColumnLayout.reference}`}
      >
        <div className="flex flex-col gap-6">
          <SnippetPanel
            idPrefix={idPrefix}
            language={snippetLanguage}
            snippet={snippet}
            onLanguageChange={setSnippetLanguage}
          />
          <RequestBodySection
            requests={operation.requests}
            components={components}
            expandDepth={expandDepth}
          />
          <ResponsesSection
            responses={operation.responses}
            components={components}
            expandDepth={expandDepth}
          />
        </div>
      </aside>
    </div>
  );
}

function RequestParameterField({
  idPrefix,
  param,
  value,
  error,
  onChange,
  inline = false,
}: {
  idPrefix: string;
  param: Param;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  inline?: boolean;
}): React.ReactNode {
  const key = parameterKey(param);
  const id = `${idPrefix}-${fieldId(key)}`;
  const schema = parameterSchema(param);
  const arrayOptions = parameterArrayOptions(schema);
  const selectedArrayOptions = value === "" ? [] : value.split(",");
  const [isArrayOptionsOpen, setIsArrayOptionsOpen] = useState(false);

  function toggleArrayOption(option: string): void {
    onChange(
      selectedArrayOptions.includes(option)
        ? selectedArrayOptions.filter((selected) => selected !== option).join(",")
        : [...selectedArrayOptions, option].join(","),
    );
  }

  return (
    <FormFieldFrame
      id={id}
      label={param.name}
      required={param.required}
      helperText={inline ? undefined : (param.description ?? undefined)}
      tooltip={inline ? undefined : (param.tooltip ?? undefined)}
      error={error ?? undefined}
      className={
        inline ? "min-w-0 [&>div:first-child]:sr-only" : "min-w-0 basis-full flex-1 sm:basis-48"
      }
    >
      {(controlProps) =>
        arrayOptions.length > 0 ? (
          <Combobox
            multiple
            open={isArrayOptionsOpen}
            onOpenChange={setIsArrayOptionsOpen}
            options={arrayOptions.map((option) => ({ label: option, value: option, data: null }))}
            selected={selectedArrayOptions}
            onSelect={toggleArrayOption}
            emptyLabel="No values found."
            showSearch={arrayOptions.length >= 10}
            searchPlaceholder="Search values..."
            trigger={
              <span className={selectedArrayOptions.length === 0 ? "text-lt-muted-fg" : undefined}>
                {selectedArrayOptions.length === 0 ? "Not set" : selectedArrayOptions.join(", ")}
              </span>
            }
            triggerClassName="flex h-lt-control-md w-full items-center rounded-lt-sm border border-lt-input bg-transparent px-3 py-1 text-left outline-none focus-visible:border-lt-ring focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50"
            triggerProps={
              {
                ...controlProps,
                "data-field-key": key,
              } as React.ComponentProps<"button"> & { "data-field-key": string }
            }
          />
        ) : Array.isArray(schema.enum) ? (
          <NativeSelect
            {...controlProps}
            value={value}
            required={param.required}
            data-field-key={key}
            onChange={(event) => onChange(event.target.value)}
          >
            {!param.required ? <option value="">Not set</option> : null}
            {schema.enum.map((option) => (
              <option key={String(option)} value={String(option)}>
                {String(option)}
              </option>
            ))}
          </NativeSelect>
        ) : schema.type === "boolean" ? (
          <NativeSelect
            {...controlProps}
            value={value}
            required={param.required}
            data-field-key={key}
            onChange={(event) => onChange(event.target.value)}
          >
            {!param.required ? <option value="">Not set</option> : null}
            <option value="true">true</option>
            <option value="false">false</option>
          </NativeSelect>
        ) : (
          <Input
            {...controlProps}
            type={parameterInputType(schema)}
            value={value}
            required={param.required}
            min={parameterMinimum(schema)}
            max={parameterMaximum(schema)}
            step={parameterStep(schema)}
            minLength={numberValue(schema.minLength)}
            maxLength={numberValue(schema.maxLength)}
            pattern={typeof schema.pattern === "string" ? schema.pattern : undefined}
            data-field-key={key}
            onChange={(event) => onChange(event.target.value)}
          />
        )
      }
    </FormFieldFrame>
  );
}

function firstErrorFieldKey(operation: Operation, errors: RequestErrors): string | null {
  for (const group of operation.paramGroups) {
    for (const param of group.params) {
      const key = parameterKey(param);

      if (isRenderableParameter(group.location, param) && errors.parameters[key] !== undefined) {
        return key;
      }
    }
  }

  return errors.body === null ? null : "body";
}

function parameterLimitationsWithoutControls(
  operation: Operation,
): Array<{ key: string; name: string; message: string }> {
  return operation.paramGroups.flatMap((group) =>
    group.params.flatMap((param) => {
      const key = parameterKey(param);
      const message = parameterLimitation(param);

      return message === null ? [] : [{ key, name: param.name, message }];
    }),
  );
}

function initialPlaygroundValues(operation: Operation, components: unknown): RequestValues {
  const values = initialRequestValues(operation, components);
  const parameters = { ...values.parameters };

  for (const param of operation.paramGroups.flatMap((group) => group.params)) {
    if (!param.required && parameterLimitation(param) !== null) {
      parameters[parameterKey(param)] = "";
    }
  }

  return { ...values, parameters };
}

function isRenderableParameter(location: string, param: Param): boolean {
  return ["path", "query", "header"].includes(location) && parameterLimitation(param) === null;
}

function isInlineParameterGroup(location: string): boolean {
  return location === "path" || location === "query";
}

function parameterSchema(param: Param): Record<string, unknown> {
  return isRecord(param.schema) ? param.schema : {};
}

function parameterArrayOptions(schema: Record<string, unknown>): string[] {
  if (schema.type !== "array" || !isRecord(schema.items) || !Array.isArray(schema.items.enum)) {
    return [];
  }

  return schema.items.enum.filter((option): option is string => typeof option === "string");
}

function parameterInputType(schema: Record<string, unknown>): React.HTMLInputTypeAttribute {
  if (schema.type === "number" || schema.type === "integer") {
    return "number";
  }

  switch (schema.format) {
    case "email":
      return "email";
    case "uri":
    case "url":
      return "url";
    case "date":
      return "date";
    case "password":
      return "password";
    default:
      return "text";
  }
}

function parameterMinimum(schema: Record<string, unknown>): number | undefined {
  return numberValue(schema.minimum) ?? numberValue(schema.exclusiveMinimum);
}

function parameterMaximum(schema: Record<string, unknown>): number | undefined {
  return numberValue(schema.maximum) ?? numberValue(schema.exclusiveMaximum);
}

function parameterStep(schema: Record<string, unknown>): number | "any" | undefined {
  const multipleOf = numberValue(schema.multipleOf);

  if (multipleOf !== undefined) {
    return multipleOf;
  }

  if (schema.type === "integer") {
    return 1;
  }

  return schema.type === "number" ? "any" : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function fieldId(key: string): string {
  return key.replaceAll(/[^a-zA-Z0-9_-]/g, "-");
}

export type ApiInfo = { title: string; version: string | null; description: string | null };
export type OperationSummary = {
  id: string;
  method: string;
  path: string;
  title: string;
  deprecated: boolean;
};
export type NavGroup = { id: string; title: string; operationIds: string[] };
export type Server = { url: string; description: string | null };
export type SecuritySchemeRef = {
  name: string;
  scopes: string[];
  type: string | null;
  scheme: string | null;
};
export type SecurityRequirement = { schemes: SecuritySchemeRef[] };
export type Navigation = {
  info: ApiInfo;
  groups: NavGroup[];
  summaries: Record<string, OperationSummary>;
  servers: Server[];
};
export type ParamGroup = { location: string; params: Param[] };
export type Param = {
  name: string;
  location: string;
  required: boolean;
  deprecated: boolean;
  description: string | null;
  tooltip: string | null;
  schema: unknown;
  example: unknown;
  style?: string | null;
  explode?: boolean | null;
};
export type ContractExample = {
  name: string | null;
  summary: string | null;
  description?: string | null;
  externalValue?: string | null;
  value: unknown;
};
export type Contract = {
  role: "request" | "response";
  status: string | null;
  mediaType: string | null;
  schema: unknown;
  title: string | null;
  examples: ContractExample[];
  headers: Param[];
  required: boolean;
};
export type Operation = {
  summary: OperationSummary;
  serverUrl: string;
  servers: Server[];
  usesRootServers: boolean;
  description: string | null;
  tooltip: string | null;
  tags: string[];
  paramGroups: ParamGroup[];
  requests: Contract[];
  responses: Contract[];
  security: SecurityRequirement[];
};

import { fakeNode } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import type { Contract, Operation, Param } from "./api-reference/types";

export function parameter(overrides: Partial<Param>): Param {
  return {
    name: "value",
    location: "query",
    required: false,
    deprecated: false,
    description: null,
    schema: { type: "string" },
    example: null,
    ...overrides,
  };
}

export function requestContract(overrides: Partial<Contract> = {}): Contract {
  return {
    role: "request",
    status: null,
    mediaType: "application/json",
    schema: { type: "object" },
    title: null,
    examples: [],
    headers: [],
    required: false,
    ...overrides,
  };
}

export function operation(
  params: Param[] = [],
  requests: Contract[] = [],
  overrides: Partial<Operation> = {},
): Operation {
  return {
    summary: {
      id: "post-widgets-id",
      method: "POST",
      path: "/widgets/{id}",
      title: "Update widget",
      deprecated: false,
    },
    serverUrl: "https://api.example.test",
    servers: [{ url: "https://api.example.test", description: null }],
    usesRootServers: true,
    description: null,
    tags: [],
    paramGroups: [
      { location: "path", params: params.filter((param) => param.location === "path") },
      { location: "query", params: params.filter((param) => param.location === "query") },
      { location: "header", params: params.filter((param) => param.location === "header") },
      { location: "cookie", params: params.filter((param) => param.location === "cookie") },
    ].filter((group) => group.params.length > 0),
    requests,
    responses: [],
    security: [],
    ...overrides,
  };
}

export function apiReferenceNode(props: Record<string, unknown>): Node<"api-reference"> {
  return fakeNode({ type: "api-reference", props });
}

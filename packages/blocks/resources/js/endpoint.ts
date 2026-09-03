import { apiFetch } from "@lattice-php/core/api";
import type { Node } from "@lattice-php/core";
import type { BlockDocument, BlockErrors, BlockNode } from "./types";

export type EditorEndpoint = { url: string; ref: string };

export type RenderResult = { node: Node; errors: Record<string, string[]> };

export type SaveResult =
  | { status: "saved"; revision: number; errors: BlockErrors }
  | { status: "conflict"; revision: number }
  | { status: "invalid"; errors: BlockErrors }
  | { status: "failed"; httpStatus: number };

async function post(
  endpoint: EditorEndpoint,
  method: "POST" | "PATCH",
  body: unknown,
  keepalive = false,
): Promise<Response> {
  return apiFetch(endpoint.url, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    keepalive,
    method,
    ref: endpoint.ref,
    throwOnError: false,
  });
}

export async function renderBlock(
  endpoint: EditorEndpoint,
  block: BlockNode,
): Promise<RenderResult | null> {
  const response = await post(endpoint, "POST", { _op: "render", block });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as {
    node: Node;
    errors?: Record<string, string[]> | unknown[];
  };

  return { errors: asRecord<Record<string, string[]>>(body.errors), node: body.node };
}

export async function saveDraft(
  endpoint: EditorEndpoint,
  document: BlockDocument,
  revision: number,
  keepalive = false,
): Promise<SaveResult> {
  return readSave(await post(endpoint, "PATCH", { document, revision }, keepalive));
}

export async function publishDocument(
  endpoint: EditorEndpoint,
  document: BlockDocument,
  revision: number,
): Promise<SaveResult> {
  return readSave(await post(endpoint, "POST", { _op: "publish", document, revision }));
}

async function readSave(response: Response): Promise<SaveResult> {
  if (response.status === 409) {
    const body = (await response.json()) as { revision: number };

    return { revision: body.revision, status: "conflict" };
  }

  if (response.status === 422) {
    const body = (await response.json()) as { errors?: unknown };

    return { errors: asRecord<BlockErrors>(body.errors), status: "invalid" };
  }

  if (!response.ok) {
    return { httpStatus: response.status, status: "failed" };
  }

  const body = (await response.json()) as { revision: number; errors?: unknown };

  return { errors: asRecord<BlockErrors>(body.errors), revision: body.revision, status: "saved" };
}

/** Error maps arrive as objects, or as `[]` when PHP serializes an empty array. */
function asRecord<T extends object>(value: unknown): T {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : ({} as T);
}

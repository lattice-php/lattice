import type { BuiltRequest } from "../request-builder";

export type SnippetTemplate = {
  id: "curl" | "javascript";
  label: string;
  generate(request: BuiltRequest): string;
};

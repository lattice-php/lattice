import type { BuiltRequest } from "../request-builder";
import type { SnippetTemplate } from "./types";

export const javascriptSnippet: SnippetTemplate = {
  id: "javascript",
  label: "JavaScript",
  generate(request: BuiltRequest): string {
    const headers = Object.entries(request.headers);

    if (headers.length === 0 && request.body === null) {
      return `fetch(${JSON.stringify(request.url)}, { method: ${JSON.stringify(request.method)} });`;
    }

    const lines = [
      `fetch(${JSON.stringify(request.url)}, {`,
      `    method: ${JSON.stringify(request.method)},`,
    ];

    if (headers.length > 0) {
      lines.push("    headers: {");
      headers.forEach(([name, value], index) => {
        const comma = index === headers.length - 1 ? "" : ",";
        lines.push(`        ${JSON.stringify(name)}: ${JSON.stringify(value)}${comma}`);
      });
      lines.push(request.body === null ? "    }" : "    },");
    }

    if (request.body !== null) {
      lines.push(`    body: ${JSON.stringify(request.body)}`);
    }

    lines.push("});");

    return lines.join("\n");
  },
};

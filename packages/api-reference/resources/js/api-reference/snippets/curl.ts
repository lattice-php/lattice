import type { BuiltRequest } from "../request-builder";
import type { SnippetTemplate } from "./types";

export const curlSnippet: SnippetTemplate = {
  id: "curl",
  label: "cURL",
  generate(request: BuiltRequest): string {
    const argumentsList = [
      `--request ${shellQuote(request.method)}`,
      `--url ${shellQuote(request.url)}`,
      ...Object.entries(request.headers).map(
        ([name, value]) => `--header ${shellQuote(`${name}: ${value}`)}`,
      ),
    ];

    if (request.body !== null) {
      argumentsList.push(`--data ${shellQuote(request.body)}`);
    }

    if (argumentsList.length === 2) {
      return `curl ${argumentsList.join(" ")}`;
    }

    return argumentsList
      .map((argument, index) => {
        const prefix = index === 0 ? "curl " : "  ";
        const continuation = index === argumentsList.length - 1 ? "" : " \\";

        return `${prefix}${argument}${continuation}`;
      })
      .join("\n");
  },
};

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

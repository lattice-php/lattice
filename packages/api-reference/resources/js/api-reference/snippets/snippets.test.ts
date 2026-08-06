import { describe, expect, it } from "vitest";
import { redactAuthorization, type BuiltRequest } from "../request-builder";
import { curlSnippet } from "./curl";
import { javascriptSnippet } from "./javascript";

describe("curlSnippet", () => {
  it("shell-quotes the method, URL, headers, and JSON body", () => {
    const request: BuiltRequest = {
      method: "POST",
      url: "https://api.example.test/widgets/O'Reilly",
      headers: {
        "X-Label": "author's pick",
        "Content-Type": "application/json",
      },
      body: '{"message":"can\'t save"}',
    };

    expect(curlSnippet.generate(request)).toBe(
      "curl --request 'POST' \\\n" +
        "  --url 'https://api.example.test/widgets/O'\"'\"'Reilly' \\\n" +
        "  --header 'X-Label: author'\"'\"'s pick' \\\n" +
        "  --header 'Content-Type: application/json' \\\n" +
        '  --data \'{"message":"can\'"\'"\'t save"}\'',
    );
  });

  it("keeps a GET without headers or a body on one line", () => {
    expect(
      curlSnippet.generate({
        method: "GET",
        url: "https://api.example.test/widgets",
        headers: {},
        body: null,
      }),
    ).toBe("curl --request 'GET' --url 'https://api.example.test/widgets'");
  });
});

describe("javascriptSnippet", () => {
  it("uses JSON-stringified fetch literals for method, URL, headers, and body", () => {
    const request: BuiltRequest = {
      method: "POST",
      url: 'https://api.example.test/widgets?label="featured"',
      headers: {
        "Content-Type": "application/json",
        "X-Label": "author's pick",
      },
      body: '{"message":"line one\\nline two"}',
    };

    expect(javascriptSnippet.generate(request)).toBe(
      'fetch("https://api.example.test/widgets?label=\\\"featured\\\"", {\n' +
        '    method: "POST",\n' +
        "    headers: {\n" +
        '        "Content-Type": "application/json",\n' +
        '        "X-Label": "author\'s pick"\n' +
        "    },\n" +
        '    body: "{\\\"message\\\":\\\"line one\\\\nline two\\\"}"\n' +
        "});",
    );
  });

  it("keeps a GET without headers or a body compact", () => {
    expect(
      javascriptSnippet.generate({
        method: "GET",
        url: "https://api.example.test/widgets",
        headers: {},
        body: null,
      }),
    ).toBe('fetch("https://api.example.test/widgets", { method: "GET" });');
  });
});

describe("authorization redaction", () => {
  it.each([
    ["cURL", curlSnippet],
    ["JavaScript", javascriptSnippet],
  ])("keeps the real token out of the %s snippet", (_label, template) => {
    const request = redactAuthorization({
      method: "GET",
      url: "https://api.example.test/widgets",
      headers: { Authorization: "Bearer real-secret-token" },
      body: null,
    });
    const snippet = template.generate(request);

    expect(snippet).toContain("Bearer <YOUR_TOKEN>");
    expect(snippet).not.toContain("real-secret-token");
  });
});

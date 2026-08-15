import { describe, expect, it } from "vitest";
import { operation, parameter, requestContract } from "../test-support";
import { buildRequest, redactAuthorization } from "./request-builder";
import { parameterKey, type RequestValues } from "./request-state";
import type { Param } from "./types";

const oauth2Security = [
  { schemes: [{ name: "oauth2", scopes: [], type: "oauth2", scheme: null }] },
];

function values(
  parameters: Array<[Param, string]>,
  overrides: Partial<RequestValues> = {},
): RequestValues {
  return {
    parameters: Object.fromEntries(
      parameters.map(([param, value]) => [parameterKey(param), value]),
    ),
    mediaType: null,
    body: "",
    ...overrides,
  };
}

describe("buildRequest", () => {
  it("adds a default JSON Accept header", () => {
    const result = buildRequest({
      operation: operation(),
      baseUrl: "https://api.example.test",
      values: values([]),
      token: null,
    });

    expect(result).toMatchObject({ request: { headers: { Accept: "application/json" } } });
  });

  it("preserves an explicit Accept header", () => {
    const accept = parameter({ name: "accept", location: "header" });
    const result = buildRequest({
      operation: operation([accept]),
      baseUrl: "https://api.example.test",
      values: values([[accept, "application/problem+json"]]),
      token: null,
    });

    expect(result).toMatchObject({ request: { headers: { accept: "application/problem+json" } } });
    expect(result.request && Object.keys(result.request.headers)).toEqual(["accept"]);
  });

  it("encodes path and query parameters and builds scalar headers, JSON, and authorization", () => {
    const id = parameter({ name: "id", location: "path", required: true });
    const search = parameter({ name: "search", location: "query", required: true });
    const page = parameter({ name: "page", location: "query", schema: { type: "integer" } });
    const trace = parameter({ name: "X-Trace", location: "header", schema: { type: "boolean" } });
    const result = buildRequest({
      operation: operation(
        [id, search, page, trace],
        [requestContract({ mediaType: "application/problem+json" })],
        { security: oauth2Security },
      ),
      baseUrl: "https://api.example.test/v1/",
      values: values(
        [
          [id, "a/b c"],
          [search, "desk & chair"],
          [page, "2"],
          [trace, "false"],
        ],
        { mediaType: "application/problem+json", body: '{"title":"can\'t save"}' },
      ),
      token: "real-secret-token",
    });

    expect(result).toEqual({
      request: {
        method: "POST",
        url: "https://api.example.test/v1/widgets/a%2Fb%20c?search=desk%20%26%20chair&page=2",
        headers: {
          Accept: "application/json",
          "X-Trace": "false",
          "Content-Type": "application/problem+json",
          Authorization: "Bearer real-secret-token",
        },
        body: '{"title":"can\'t save"}',
      },
      errors: null,
    });
  });

  it("serializes a form array query parameter as one comma-separated value", () => {
    const fields = parameter({
      name: "fields[users]",
      location: "query",
      style: "form",
      explode: false,
      schema: { type: "array", items: { type: "string", enum: ["name", "email"] } },
    });

    expect(
      buildRequest({
        operation: operation([fields]),
        baseUrl: "https://api.example.test",
        values: values([[fields, "name,email"]]),
        token: null,
      }),
    ).toEqual({
      request: {
        method: "POST",
        url: "https://api.example.test/widgets/{id}?fields%5Busers%5D=name%2Cemail",
        headers: { Accept: "application/json" },
        body: null,
      },
      errors: null,
    });
  });

  it("serializes primitive form arrays as normalized comma-separated values", () => {
    const ids = parameter({
      name: "filter[id]",
      location: "query",
      style: "form",
      explode: false,
      schema: { type: "array", items: { type: "integer" } },
    });

    expect(
      buildRequest({
        operation: operation([ids]),
        baseUrl: "https://api.example.test",
        values: values([[ids, "1, 2,3"]]),
        token: null,
      }),
    ).toEqual({
      request: {
        method: "POST",
        url: "https://api.example.test/widgets/{id}?filter%5Bid%5D=1%2C2%2C3",
        headers: { Accept: "application/json" },
        body: null,
      },
      errors: null,
    });
  });

  it("validates form array cardinality and every item schema", () => {
    const between = parameter({
      name: "filter[published_on.between]",
      location: "query",
      style: "form",
      explode: false,
      filterType: "between",
      schema: {
        type: "array",
        items: { type: "string", format: "date" },
        minItems: 2,
        maxItems: 2,
      },
    });

    expect(
      buildRequest({
        operation: operation([between]),
        baseUrl: "https://api.example.test",
        values: values([[between, "2026-08-01"]]),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: {
        parameters: { "query:filter[published_on.between]": "Enter exactly 2 values." },
        body: null,
        request: null,
      },
    });

    expect(
      buildRequest({
        operation: operation([between]),
        baseUrl: "https://api.example.test",
        values: values([[between, "2026-08-01,not-a-date"]]),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: {
        parameters: {
          "query:filter[published_on.between]": "Value 2: Enter a valid date.",
        },
        body: null,
        request: null,
      },
    });
  });

  it("omits empty optional query and header values and does not invent authorization", () => {
    const id = parameter({ name: "id", location: "path", required: true });
    const filter = parameter({ name: "filter", location: "query" });
    const trace = parameter({ name: "X-Trace", location: "header" });

    expect(
      buildRequest({
        operation: operation([id, filter, trace]),
        baseUrl: "https://api.example.test",
        values: values([
          [id, "7"],
          [filter, ""],
          [trace, ""],
        ]),
        token: null,
      }),
    ).toEqual({
      request: {
        method: "POST",
        url: "https://api.example.test/widgets/7",
        headers: { Accept: "application/json" },
        body: null,
      },
      errors: null,
    });
  });

  it("omits an empty optional complex parameter", () => {
    const id = parameter({ name: "id", location: "path", required: true });
    const filters = parameter({ name: "filters", location: "query", schema: { type: "array" } });

    expect(
      buildRequest({
        operation: operation([id, filters]),
        baseUrl: "https://api.example.test",
        values: values([
          [id, "7"],
          [filters, ""],
        ]),
        token: null,
      }),
    ).toEqual({
      request: {
        method: "POST",
        url: "https://api.example.test/widgets/7",
        headers: { Accept: "application/json" },
        body: null,
      },
      errors: null,
    });
  });

  it.each([
    ["cookie", parameter({ name: "session", location: "cookie" })],
    ["forbidden header", parameter({ name: "Host", location: "header" })],
  ])("omits an empty optional %s parameter", (_label, unsupported) => {
    expect(
      buildRequest({
        operation: operation([unsupported]),
        baseUrl: "https://api.example.test",
        values: values([[unsupported, ""]]),
        token: null,
      }),
    ).toEqual({
      request: {
        method: "POST",
        url: "https://api.example.test/widgets/{id}",
        headers: { Accept: "application/json" },
        body: null,
      },
      errors: null,
    });
  });

  it.each([
    [
      "complex",
      parameter({ name: "filters", location: "query", required: true, schema: { type: "array" } }),
      "Only primitive parameters can be executed.",
    ],
    [
      "cookie",
      parameter({ name: "session", location: "cookie", required: true }),
      "Cookie parameters cannot be sent from a browser.",
    ],
    [
      "forbidden header",
      parameter({ name: "Host", location: "header", required: true }),
      "This header cannot be sent from a browser.",
    ],
  ])("blocks an empty required %s parameter", (_label, unsupported, message) => {
    expect(
      buildRequest({
        operation: operation([unsupported]),
        baseUrl: "https://api.example.test",
        values: values([[unsupported, ""]]),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: {
        parameters: { [parameterKey(unsupported)]: message },
        body: null,
        request: null,
      },
    });
  });

  it("blocks a populated cookie parameter", () => {
    const cookie = parameter({ name: "session", location: "cookie" });

    expect(
      buildRequest({
        operation: operation([cookie]),
        baseUrl: "https://api.example.test",
        values: values([[cookie, "secret"]]),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: {
        parameters: { "cookie:session": "Cookie parameters cannot be sent from a browser." },
        body: null,
        request: null,
      },
    });
  });

  it("deduplicates case-insensitive generated header collisions", () => {
    const id = parameter({ name: "id", location: "path", required: true });
    const contentType = parameter({ name: "content-type", location: "header" });
    const authorization = parameter({ name: "authorization", location: "header" });
    const result = buildRequest({
      operation: operation([id, contentType, authorization], [requestContract()], {
        security: oauth2Security,
      }),
      baseUrl: "https://api.example.test",
      values: values(
        [
          [id, "7"],
          [contentType, "text/plain"],
          [authorization, "Basic stale-credential"],
        ],
        { mediaType: "application/json", body: '{"name":"Desk"}' },
      ),
      token: "real-secret-token",
    });

    expect(result).toEqual({
      request: {
        method: "POST",
        url: "https://api.example.test/widgets/7",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer real-secret-token",
        },
        body: '{"name":"Desk"}',
      },
      errors: null,
    });
  });

  it("adds a configured token for an HTTP bearer security scheme", () => {
    const result = buildRequest({
      operation: operation([], [], {
        security: [{ schemes: [{ name: "bearer", scopes: [], type: "http", scheme: "bearer" }] }],
      }),
      baseUrl: "https://api.example.test",
      values: values([]),
      token: "real-secret-token",
    });

    expect(result).toMatchObject({
      request: { headers: { Authorization: "Bearer real-secret-token" } },
    });
  });

  it.each([
    ["public operations", []],
    ["HTTP basic", [{ schemes: [{ name: "basic", scopes: [], type: "http", scheme: "basic" }] }]],
    ["API keys", [{ schemes: [{ name: "apiKey", scopes: [], type: "apiKey", scheme: null }] }]],
  ])("does not add an OAuth access token to %s", (_label, security) => {
    const result = buildRequest({
      operation: operation([], [], { security }),
      baseUrl: "https://api.example.test",
      values: values([]),
      token: "real-secret-token",
    });

    expect(result).toMatchObject({ request: { headers: { Accept: "application/json" } } });
    expect(result.request && new Headers(result.request.headers).has("Authorization")).toBe(false);
  });

  it("returns field errors for empty required path, query, and header values", () => {
    const id = parameter({ name: "id", location: "path", required: true });
    const filter = parameter({ name: "filter", location: "query", required: true });
    const trace = parameter({ name: "X-Trace", location: "header", required: true });

    expect(
      buildRequest({
        operation: operation([id, filter, trace]),
        baseUrl: "https://api.example.test",
        values: values([
          [id, ""],
          [filter, ""],
          [trace, ""],
        ]),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: {
        parameters: {
          "path:id": "This path parameter is required.",
          "query:filter": "This query parameter is required.",
          "header:X-Trace": "This header parameter is required.",
        },
        body: null,
        request: null,
      },
    });
  });

  it.each([
    [{ type: "number" }, "not-a-number", "Enter a number."],
    [{ type: "integer" }, "1.5", "Enter an integer."],
    [{ type: "number", minimum: 1 }, "0", "Enter a value greater than or equal to 1."],
    [{ type: "number", exclusiveMinimum: 1 }, "1", "Enter a value greater than 1."],
    [{ type: "number", maximum: 10 }, "11", "Enter a value less than or equal to 10."],
    [{ type: "number", exclusiveMaximum: 10 }, "10", "Enter a value less than 10."],
    [{ type: "number", multipleOf: 0.5 }, "1.2", "Enter a multiple of 0.5."],
    [{ type: "string", minLength: 3 }, "ab", "Enter at least 3 characters."],
    [{ type: "string", maxLength: 3 }, "abcd", "Enter no more than 3 characters."],
    [{ type: "string", pattern: "^[a-z]+$" }, "ABC", "Match the required pattern."],
  ])("validates a parameter against its schema constraints", (schema, value, message) => {
    const constrained = parameter({ name: "constrained", schema });

    expect(
      buildRequest({
        operation: operation([constrained]),
        baseUrl: "https://api.example.test",
        values: values([[constrained, value]]),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: {
        parameters: { "query:constrained": message },
        body: null,
        request: null,
      },
    });
  });

  it("rejects missing and invalid required JSON bodies", () => {
    const requiredJson = requestContract({ required: true });

    expect(
      buildRequest({
        operation: operation([], [requiredJson]),
        baseUrl: "https://api.example.test",
        values: values([], { mediaType: "application/json", body: "" }),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: { parameters: {}, body: "A JSON request body is required.", request: null },
    });

    expect(
      buildRequest({
        operation: operation([], [requiredJson]),
        baseUrl: "https://api.example.test",
        values: values([], { mediaType: "application/json", body: "{invalid" }),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: { parameters: {}, body: "Enter a valid JSON request body.", request: null },
    });
  });

  it.each(["Cookie", "Cookie2", "Set-Cookie", "Host", "Content-Length", "Origin"])(
    "rejects the forbidden %s header",
    (name) => {
      const forbidden = parameter({ name, location: "header" });

      expect(
        buildRequest({
          operation: operation([forbidden]),
          baseUrl: "https://api.example.test",
          values: values([[forbidden, "unsafe"]]),
          token: null,
        }),
      ).toEqual({
        request: null,
        errors: {
          parameters: { [`header:${name}`]: "This header cannot be sent from a browser." },
          body: null,
          request: null,
        },
      });
    },
  );

  it.each([
    ["X-HTTP-Method", "connect"],
    ["X-HTTP-Method-Override", "TRACE"],
    ["X-Method-Override", "Track"],
    ["X-HTTP-Method", "PATCH, trace"],
    ["X-HTTP-Method-Override", " connect , PATCH"],
    ["X-Method-Override", "POST, TrAcK "],
  ])("rejects %s when its value is the forbidden method %s", (name, value) => {
    const forbidden = parameter({ name, location: "header" });

    expect(
      buildRequest({
        operation: operation([forbidden]),
        baseUrl: "https://api.example.test",
        values: values([[forbidden, value]]),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: {
        parameters: { [`header:${name}`]: "This header cannot be sent from a browser." },
        body: null,
        request: null,
      },
    });
  });

  it.each(["X-HTTP-Method", "X-HTTP-Method-Override", "X-Method-Override"])(
    "allows %s with a non-forbidden method value",
    (name) => {
      const allowed = parameter({ name, location: "header" });

      expect(
        buildRequest({
          operation: operation([allowed]),
          baseUrl: "https://api.example.test",
          values: values([[allowed, "POST, PATCH"]]),
          token: null,
        }),
      ).toEqual({
        request: {
          method: "POST",
          url: "https://api.example.test/widgets/{id}",
          headers: { Accept: "application/json", [name]: "POST, PATCH" },
          body: null,
        },
        errors: null,
      });
    },
  );

  it.each(["array", "object"])("rejects %s parameters as non-executable", (type) => {
    const complex = parameter({ name: "complex", schema: { type } });

    expect(
      buildRequest({
        operation: operation([complex]),
        baseUrl: "https://api.example.test",
        values: values([[complex, "value"]]),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: {
        parameters: { "query:complex": "Only primitive parameters can be executed." },
        body: null,
        request: null,
      },
    });
  });

  it.each([
    ["$ref", { $ref: "#/components/schemas/Identifier" }],
    ["oneOf", { oneOf: [{ type: "string" }, { type: "integer" }] }],
    ["allOf", { allOf: [{ type: "string" }] }],
    ["anyOf", { anyOf: [{ type: "string" }] }],
    ["missing type", {}],
  ])("rejects the %s non-scalar parameter schema", (_label, schema) => {
    const unresolved = parameter({ name: "unresolved", schema });

    expect(
      buildRequest({
        operation: operation([unresolved]),
        baseUrl: "https://api.example.test",
        values: values([[unresolved, "value"]]),
        token: null,
      }),
    ).toEqual({
      request: null,
      errors: {
        parameters: { "query:unresolved": "Only primitive parameters can be executed." },
        body: null,
        request: null,
      },
    });
  });

  it.each([
    [
      "absolute",
      "https://api.example.test/v1?locale=en#documentation",
      "https://api.example.test/v1/widgets/a%2Fb?locale=en&search=desk%20%26%20chair",
    ],
    [
      "relative",
      "../api/v1?locale=en#documentation",
      "../api/v1/widgets/a%2Fb?locale=en&search=desk%20%26%20chair",
    ],
  ])("joins an %s base URL query and fragment at the pathname", (_kind, baseUrl, expectedUrl) => {
    const id = parameter({ name: "id", location: "path", required: true });
    const search = parameter({ name: "search", location: "query" });

    expect(
      buildRequest({
        operation: operation([id, search]),
        baseUrl,
        values: values([
          [id, "a/b"],
          [search, "desk & chair"],
        ]),
        token: null,
      }),
    ).toEqual({
      request: {
        method: "POST",
        url: expectedUrl,
        headers: { Accept: "application/json" },
        body: null,
      },
      errors: null,
    });
  });

  it("returns a request error when no server URL is selected", () => {
    expect(
      buildRequest({ operation: operation(), baseUrl: null, values: values([]), token: null }),
    ).toEqual({
      request: null,
      errors: {
        parameters: {},
        body: null,
        request: "Select a server URL before sending the request.",
      },
    });
  });
});

describe("redactAuthorization", () => {
  it("clones the request and redacts a case-insensitive bearer authorization header", () => {
    const request = {
      method: "GET",
      url: "https://api.example.test/widgets",
      headers: { authorization: "bearer real-secret-token", Accept: "application/json" },
      body: null,
    };

    expect(redactAuthorization(request)).toEqual({
      ...request,
      headers: { authorization: "Bearer <YOUR_TOKEN>", Accept: "application/json" },
    });
    expect(request.headers.authorization).toBe("bearer real-secret-token");
  });
});

import { describe, expect, it } from "vitest";
import { buildNavigation, filterNavigationByTags, parseOperation } from "./parse";

const spec = {
  openapi: "3.0.0",
  info: { title: "Test API", version: "1.0.0", description: "A tiny test API" },
  paths: {
    "/users/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        operationId: "getUser",
        summary: "Get user",
        description: "Fetches a single user by id.",
        tags: ["Users", "Admin"],
        parameters: [
          {
            name: "include",
            in: "query",
            required: false,
            style: "form",
            explode: false,
            schema: { type: "array", items: { type: "string", enum: ["roles", "rolesCount"] } },
          },
        ],
        requestBody: {
          description: "User payload",
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: { name: { type: "string" } } },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": { schema: { type: "object" } },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/pets": {
      get: {
        summary: "List pets",
        tags: ["Pets"],
        responses: { "200": { description: "OK" } },
      },
      post: {
        deprecated: true,
        responses: { "201": { description: "Created" } },
      },
    },
    "/posts": {
      get: {
        operationId: "listPosts",
        summary: "List posts",
        tags: ["Posts"],
        parameters: [{ $ref: "#/components/parameters/PageParam" }],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { type: "array" } } },
          },
        },
      },
    },
    "/articles": {
      post: {
        operationId: "createArticle",
        summary: "Create article",
        tags: ["Articles"],
        requestBody: { $ref: "#/components/requestBodies/UserBody" },
        responses: {
          "201": {
            description: "Created",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },
  },
  components: {
    parameters: {
      PageParam: {
        name: "page",
        in: "query",
        required: false,
        schema: { type: "integer" },
        description: "Page number",
      },
    },
    requestBodies: {
      UserBody: {
        description: "User creation payload",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
              },
            },
          },
        },
      },
    },
    responses: {
      NotFound: {
        description: "Not found",
        content: {
          "application/json": {
            schema: { type: "object", properties: { message: { type: "string" } } },
          },
        },
      },
    },
  },
};

describe("buildNavigation", () => {
  it("exposes the spec info", () => {
    const nav = buildNavigation(spec);
    expect(nav.info).toEqual({
      title: "Test API",
      version: "1.0.0",
      description: "A tiny test API",
    });
  });

  it("groups operations by tag, in first-appearance order, with a Default fallback", () => {
    const nav = buildNavigation(spec);
    expect(nav.groups.map((g) => g.title)).toEqual([
      "Users",
      "Admin",
      "Pets",
      "Default",
      "Posts",
      "Articles",
    ]);
  });

  it("puts a multi-tag operation's id into every one of its tag groups", () => {
    const nav = buildNavigation(spec);
    const users = nav.groups.find((g) => g.title === "Users")!;
    const admin = nav.groups.find((g) => g.title === "Admin")!;
    expect(users.operationIds).toEqual(["get-users-id"]);
    expect(admin.operationIds).toEqual(["get-users-id"]);
  });

  it("groups tagless operations under Default", () => {
    const nav = buildNavigation(spec);
    const fallback = nav.groups.find((g) => g.title === "Default")!;
    expect(fallback.operationIds).toEqual(["post-pets"]);
  });

  it("builds a cheap summary per operation, without parsing params/bodies", () => {
    const nav = buildNavigation(spec);

    expect(nav.summaries["get-users-id"]).toEqual({
      id: "get-users-id",
      method: "GET",
      path: "/users/{id}",
      title: "Get user",
      deprecated: false,
    });

    expect(nav.summaries["get-pets"]).toEqual({
      id: "get-pets",
      method: "GET",
      path: "/pets",
      title: "List pets",
      deprecated: false,
    });

    expect(nav.summaries["post-pets"]).toEqual({
      id: "post-pets",
      method: "POST",
      path: "/pets",
      title: "POST /pets",
      deprecated: true,
    });
  });
});

describe("parseOperation", () => {
  it("returns null for an unknown operation id", () => {
    expect(parseOperation(spec, "get-does-not-exist")).toBeNull();
  });

  it("merges shared and operation-level params, bucketed by location", () => {
    const op = parseOperation(spec, "get-users-id")!;

    expect(op.paramGroups).toEqual([
      {
        location: "path",
        params: [
          {
            name: "id",
            location: "path",
            required: true,
            deprecated: false,
            description: null,
            schema: { type: "string" },
            example: null,
          },
        ],
      },
      {
        location: "query",
        params: [
          {
            name: "include",
            location: "query",
            required: false,
            deprecated: false,
            description: null,
            schema: { type: "array", items: { type: "string", enum: ["roles", "rolesCount"] } },
            example: null,
            style: "form",
            explode: false,
          },
        ],
      },
    ]);
  });

  it("carries the summary, description and tags", () => {
    const op = parseOperation(spec, "get-users-id")!;

    expect(op.summary).toEqual({
      id: "get-users-id",
      method: "GET",
      path: "/users/{id}",
      title: "Get user",
      deprecated: false,
    });
    expect(op.description).toBe("Fetches a single user by id.");
    expect(op.tags).toEqual(["Users", "Admin"]);
  });

  it("carries a parameter example", () => {
    const operation = parseOperation(
      {
        openapi: "3.0.0",
        info: { title: "Examples API", version: "1.0.0", description: null },
        paths: {
          "/widgets": {
            get: {
              parameters: [
                {
                  name: "status",
                  in: "query",
                  required: true,
                  example: "active",
                  schema: { type: "string", enum: ["active", "disabled"] },
                },
              ],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      },
      "get-widgets",
    )!;

    expect(operation.paramGroups[0].params[0].example).toBe("active");
  });

  it("uses the first parameter examples value when example is absent", () => {
    const operation = parseOperation(
      {
        openapi: "3.1.0",
        info: { title: "Examples API", version: "1.0.0" },
        paths: {
          "/widgets/{widget}": {
            get: {
              parameters: [
                {
                  name: "widget",
                  in: "path",
                  required: true,
                  examples: {
                    default: { value: "widget_123" },
                  },
                  schema: { type: "string" },
                },
              ],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      },
      "get-widgets-widget",
    )!;

    expect(operation.paramGroups[0].params[0].example).toBe("widget_123");
  });

  it("builds the request Contract from requestBody", () => {
    const op = parseOperation(spec, "get-users-id")!;

    expect(op.requests).toEqual([
      {
        role: "request",
        status: null,
        mediaType: "application/json",
        schema: { type: "object", properties: { name: { type: "string" } } },
        title: "User payload",
        examples: [],
        headers: [],
        required: true,
      },
    ]);
  });

  it("builds a response Contract per status/mediaType, resolving a $ref response", () => {
    const op = parseOperation(spec, "get-users-id")!;

    expect(op.responses).toEqual([
      {
        role: "response",
        status: "200",
        mediaType: "application/json",
        schema: { type: "object" },
        title: "OK",
        examples: [],
        headers: [],
        required: false,
      },
      {
        role: "response",
        status: "404",
        mediaType: "application/json",
        schema: { type: "object", properties: { message: { type: "string" } } },
        title: "Not found",
        examples: [],
        headers: [],
        required: false,
      },
    ]);
  });

  it("produces a bodyless response Contract with a null schema", () => {
    const op = parseOperation(spec, "get-pets")!;

    expect(op.responses).toEqual([
      {
        role: "response",
        status: "200",
        mediaType: null,
        schema: null,
        title: "OK",
        examples: [],
        headers: [],
        required: false,
      },
    ]);
  });

  it("resolves a $ref parameter and merges it into paramGroups", () => {
    const op = parseOperation(spec, "get-posts")!;

    expect(op.paramGroups).toEqual([
      {
        location: "query",
        params: [
          {
            name: "page",
            location: "query",
            required: false,
            deprecated: false,
            description: "Page number",
            schema: { type: "integer" },
            example: null,
          },
        ],
      },
    ]);
  });

  it("resolves a $ref requestBody and builds the request Contract", () => {
    const op = parseOperation(spec, "post-articles")!;

    expect(op.requests).toEqual([
      {
        role: "request",
        status: null,
        mediaType: "application/json",
        schema: { type: "object", properties: { name: { type: "string" } } },
        title: "User creation payload",
        examples: [],
        headers: [],
        required: false,
      },
    ]);
  });

  it("resolves to no security requirements when neither the operation nor the spec declares any", () => {
    const op = parseOperation(spec, "get-users-id")!;

    expect(op.security).toEqual([]);
  });
});

describe("buildExamples", () => {
  it("returns a single unnamed example from `example` on both a request and a response mediaType", () => {
    const op = parseOperation(
      {
        openapi: "3.0.0",
        info: { title: "Examples API", version: "1.0.0", description: null },
        paths: {
          "/widgets": {
            post: {
              operationId: "createWidget",
              requestBody: {
                content: {
                  "application/json": {
                    schema: { type: "object" },
                    example: { name: "Widget" },
                  },
                },
              },
              responses: {
                "201": {
                  description: "Created",
                  content: {
                    "application/json": {
                      schema: { type: "object" },
                      example: { id: 1, name: "Widget" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "post-widgets",
    )!;

    expect(op.requests[0].examples).toEqual([
      { name: null, summary: null, value: { name: "Widget" } },
    ]);
    expect(op.responses[0].examples).toEqual([
      { name: null, summary: null, value: { id: 1, name: "Widget" } },
    ]);
  });

  it("returns one ContractExample per key in an `examples` map, with name and summary", () => {
    const op = parseOperation(
      {
        openapi: "3.0.0",
        info: { title: "Examples API", version: "1.0.0", description: null },
        paths: {
          "/widgets": {
            get: {
              operationId: "getWidgets",
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: { type: "object" },
                      examples: {
                        basic: { summary: "A basic widget", value: { id: 1 } },
                        deluxe: { value: { id: 2, deluxe: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "get-widgets",
    )!;

    expect(op.responses[0].examples).toEqual([
      { name: "basic", summary: "A basic widget", value: { id: 1 } },
      { name: "deluxe", summary: null, value: { id: 2, deluxe: true } },
    ]);
  });

  it("resolves a `{ $ref }` example from components.examples", () => {
    const op = parseOperation(
      {
        openapi: "3.0.0",
        info: { title: "Examples API", version: "1.0.0", description: null },
        paths: {
          "/widgets": {
            get: {
              operationId: "getWidgets",
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: { type: "object" },
                      examples: {
                        shared: { $ref: "#/components/examples/SharedWidget" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          examples: {
            SharedWidget: { summary: "Shared widget example", value: { id: 3 } },
          },
        },
      },
      "get-widgets",
    )!;

    expect(op.responses[0].examples).toEqual([
      { name: "shared", summary: "Shared widget example", value: { id: 3 } },
    ]);
  });

  it("preserves example descriptions and external values", () => {
    const op = parseOperation(
      {
        openapi: "3.1.0",
        info: { title: "Examples API", version: "1.0.0" },
        paths: {
          "/widgets": {
            get: {
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      examples: {
                        inline: {
                          description: "A complete inline example.",
                          value: { id: 1 },
                        },
                        external: {
                          summary: "Large payload",
                          externalValue: "https://example.test/widgets.json",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "get-widgets",
    )!;

    expect(op.responses[0].examples).toEqual([
      {
        name: "inline",
        summary: null,
        description: "A complete inline example.",
        value: { id: 1 },
      },
      {
        name: "external",
        summary: "Large payload",
        externalValue: "https://example.test/widgets.json",
        value: undefined,
      },
    ]);
  });

  it("prefers a non-empty `examples` map over `example` when both are present", () => {
    const op = parseOperation(
      {
        openapi: "3.0.0",
        info: { title: "Examples API", version: "1.0.0", description: null },
        paths: {
          "/widgets": {
            get: {
              operationId: "getWidgets",
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: { type: "object" },
                      example: { id: 999 },
                      examples: {
                        named: { value: { id: 1 } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "get-widgets",
    )!;

    expect(op.responses[0].examples).toEqual([{ name: "named", summary: null, value: { id: 1 } }]);
  });

  it("returns an empty array when neither `example` nor `examples` is present", () => {
    const op = parseOperation(spec, "get-users-id")!;

    expect(op.requests[0].examples).toEqual([]);
    expect(op.responses[0].examples).toEqual([]);
  });
});

describe("buildNavigation servers", () => {
  it("extracts servers with url and description", () => {
    const withServers = {
      ...spec,
      servers: [
        { url: "https://api.example.com", description: "Production" },
        { url: "https://staging.example.com" },
      ],
    };

    const nav = buildNavigation(withServers);

    expect(nav.servers).toEqual([
      { url: "https://api.example.com", description: "Production" },
      { url: "https://staging.example.com", description: null },
    ]);
  });

  it("defaults to the relative root server when servers is absent", () => {
    const nav = buildNavigation(spec);

    expect(nav.servers).toEqual([{ url: "/", description: null }]);
  });

  it("resolves server precedence and substitutes variable defaults", () => {
    const rootServer = {
      url: "https://{environment}.root.example/{version}",
      variables: {
        environment: { default: "production" },
        version: { default: "v1" },
      },
    };
    const pathServer = {
      url: "https://{region}.path.example",
      variables: { region: { default: "eu" } },
    };
    const operationServer = {
      url: "https://{tenant}.operation.example",
      variables: { tenant: { default: "acme" } },
    };
    const operationWithServers = {
      openapi: "3.1.0",
      info: { title: "Test API", version: "1.0.0" },
      servers: [rootServer],
      paths: {
        "/widgets": {
          servers: [pathServer],
          get: {
            servers: [operationServer],
            responses: { "200": { description: "OK" } },
          },
        },
      },
    };

    expect(buildNavigation(operationWithServers).servers[0]?.url).toBe(
      "https://production.root.example/v1",
    );
    expect(parseOperation(operationWithServers, "get-widgets")?.serverUrl).toBe(
      "https://acme.operation.example",
    );
    expect(
      parseOperation(operationWithServers, "get-widgets", "https://staging.root.example")
        ?.serverUrl,
    ).toBe("https://acme.operation.example");

    const pathOnly = {
      ...operationWithServers,
      paths: {
        "/widgets": {
          servers: [pathServer],
          get: { responses: { "200": { description: "OK" } } },
        },
      },
    };
    expect(parseOperation(pathOnly, "get-widgets", "https://staging.root.example")?.serverUrl).toBe(
      "https://eu.path.example",
    );

    const rootOnly = {
      ...operationWithServers,
      servers: [rootServer, { url: "https://staging.root.example/v1" }],
      paths: {
        "/widgets": {
          get: { responses: { "200": { description: "OK" } } },
        },
      },
    };
    expect(parseOperation(rootOnly, "get-widgets")?.serverUrl).toBe(
      "https://production.root.example/v1",
    );
    expect(
      parseOperation(rootOnly, "get-widgets", "https://staging.root.example/v1")?.serverUrl,
    ).toBe("https://staging.root.example/v1");
    expect(parseOperation(rootOnly, "get-widgets")?.usesRootServers).toBe(true);
    expect(parseOperation(operationWithServers, "get-widgets")?.servers).toEqual([
      { url: "https://acme.operation.example", description: null },
    ]);
    expect(parseOperation(operationWithServers, "get-widgets")?.usesRootServers).toBe(false);
    expect(parseOperation({ ...rootOnly, servers: [] }, "get-widgets")?.serverUrl).toBe("/");
  });
});

describe("filterNavigationByTags", () => {
  it("keeps only groups whose title is in the tag set, pruning summaries to the kept operation ids", () => {
    const nav = buildNavigation(spec);
    const filtered = filterNavigationByTags(nav, ["Users", "Pets"]);

    expect(filtered.groups.map((g) => g.title)).toEqual(["Users", "Pets"]);
    expect(Object.keys(filtered.summaries).sort()).toEqual(["get-pets", "get-users-id"]);
  });

  it("leaves info and servers intact", () => {
    const withServers = { ...spec, servers: [{ url: "https://api.example.com" }] };
    const nav = buildNavigation(withServers);
    const filtered = filterNavigationByTags(nav, ["Users"]);

    expect(filtered.info).toEqual(nav.info);
    expect(filtered.servers).toEqual(nav.servers);
  });

  it("returns no groups and no summaries when no tag matches", () => {
    const nav = buildNavigation(spec);
    const filtered = filterNavigationByTags(nav, ["DoesNotExist"]);

    expect(filtered.groups).toEqual([]);
    expect(filtered.summaries).toEqual({});
  });

  it("returns no groups when the tag list is empty", () => {
    const nav = buildNavigation(spec);
    const filtered = filterNavigationByTags(nav, []);

    expect(filtered.groups).toEqual([]);
    expect(filtered.summaries).toEqual({});
  });
});

describe("effective security resolution", () => {
  const securitySpec = {
    openapi: "3.0.0",
    info: { title: "Security API", version: "1.0.0", description: null },
    security: [{ http: [] }],
    components: {
      securitySchemes: {
        http: { type: "http", scheme: "bearer" },
        oauth2: {
          type: "oauth2",
          flows: {
            authorizationCode: {
              authorizationUrl: "https://auth.example.test/oauth/authorize",
              tokenUrl: "https://auth.example.test/oauth/token",
              scopes: { read: "Read", write: "Write" },
            },
          },
        },
      },
    },
    paths: {
      "/inherited": {
        get: {
          operationId: "getInherited",
          responses: { "200": { description: "OK" } },
        },
      },
      "/public": {
        get: {
          operationId: "getPublic",
          security: [],
          responses: { "200": { description: "OK" } },
        },
      },
      "/override": {
        get: {
          operationId: "getOverride",
          security: [{ oauth2: ["read", "write"] }],
          responses: { "200": { description: "OK" } },
        },
      },
      "/optional": {
        get: {
          operationId: "getOptional",
          security: [{}],
          responses: { "200": { description: "OK" } },
        },
      },
    },
  };

  it("inherits the top-level security when the operation omits it", () => {
    const op = parseOperation(securitySpec, "get-inherited")!;

    expect(op.security).toEqual([
      { schemes: [{ name: "http", scopes: [], type: "http", scheme: "bearer" }] },
    ]);
  });

  it("treats an explicit empty security array as public, overriding the top-level default", () => {
    const op = parseOperation(securitySpec, "get-public")!;

    expect(op.security).toEqual([]);
  });

  it("uses the operation's own security requirements when present, with scopes carried through", () => {
    const op = parseOperation(securitySpec, "get-override")!;

    expect(op.security).toEqual([
      { schemes: [{ name: "oauth2", scopes: ["read", "write"], type: "oauth2", scheme: null }] },
    ]);
  });

  it("resolves an empty requirement object to a requirement with no schemes", () => {
    const op = parseOperation(securitySpec, "get-optional")!;

    expect(op.security).toEqual([{ schemes: [] }]);
  });
});

describe("response headers", () => {
  it("extracts response headers into Param entries", () => {
    const op = parseOperation(
      {
        openapi: "3.0.0",
        info: { title: "Headers API", version: "1.0.0", description: null },
        paths: {
          "/widgets": {
            get: {
              operationId: "getWidgets",
              responses: {
                "200": {
                  description: "OK",
                  content: { "application/json": { schema: { type: "object" } } },
                  headers: {
                    "X-RateLimit-Limit": {
                      description: "Requests allowed per window",
                      schema: { type: "integer" },
                    },
                    "X-RateLimit-Remaining": {
                      required: true,
                      schema: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "get-widgets",
    )!;

    expect(op.responses[0].headers).toEqual([
      {
        name: "X-RateLimit-Limit",
        location: "header",
        required: false,
        deprecated: false,
        description: "Requests allowed per window",
        schema: { type: "integer" },
        example: null,
      },
      {
        name: "X-RateLimit-Remaining",
        location: "header",
        required: true,
        deprecated: false,
        description: null,
        schema: { type: "integer" },
        example: null,
      },
    ]);
  });

  it("resolves a $ref response header from components.headers", () => {
    const op = parseOperation(
      {
        openapi: "3.0.0",
        info: { title: "Headers API", version: "1.0.0", description: null },
        paths: {
          "/widgets": {
            get: {
              operationId: "getWidgets",
              responses: {
                "200": {
                  description: "OK",
                  headers: {
                    "X-Request-Id": { $ref: "#/components/headers/RequestId" },
                  },
                },
              },
            },
          },
        },
        components: {
          headers: {
            RequestId: {
              description: "Correlates logs to this request",
              schema: { type: "string" },
            },
          },
        },
      },
      "get-widgets",
    )!;

    expect(op.responses[0].headers).toEqual([
      {
        name: "X-Request-Id",
        location: "header",
        required: false,
        deprecated: false,
        description: "Correlates logs to this request",
        schema: { type: "string" },
        example: null,
      },
    ]);
  });

  it("returns an empty array when a response has no headers", () => {
    const op = parseOperation(spec, "get-users-id")!;

    expect(op.responses[0].headers).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { operationToMarkdown } from "./operation-markdown";
import type { Operation } from "./types";

const operation: Operation = {
  summary: {
    id: "create-widget",
    method: "POST",
    path: "/widgets/{widget}",
    title: "Create widget",
    deprecated: false,
  },
  serverUrl: "https://api.example.test",
  servers: [{ url: "https://api.example.test", description: null }],
  usesRootServers: true,
  description: "Creates a widget.",
  tags: [],
  security: [
    {
      schemes: [
        { name: "bearer", scopes: ["widgets:write"], type: "http", scheme: "bearer" },
        { name: "service-key", scopes: [], type: "apiKey", scheme: null },
      ],
    },
    { schemes: [{ name: "signed-request", scopes: [], type: "http", scheme: "signature" }] },
  ],
  paramGroups: [
    {
      location: "path",
      params: [
        {
          name: "widget",
          location: "path",
          required: true,
          deprecated: false,
          description: "Widget identifier",
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
        },
      ],
    },
  ],
  requests: [
    {
      role: "request",
      status: null,
      mediaType: "application/json",
      schema: { type: "object", properties: { name: { type: "string", example: "Widget" } } },
      title: null,
      examples: [],
      headers: [],
      required: true,
    },
  ],
  responses: [
    {
      role: "response",
      status: "201",
      mediaType: "application/json",
      schema: { type: "object", properties: { id: { type: "string", example: "widget_123" } } },
      title: "Widget created",
      examples: [],
      headers: [
        {
          name: "X-Request-Id",
          location: "header",
          required: false,
          deprecated: false,
          description: "Correlates the request",
          schema: { type: "string" },
          example: null,
        },
      ],
      required: false,
    },
    {
      role: "response",
      status: "422",
      mediaType: "application/json",
      schema: null,
      title: "Validation failed",
      examples: [{ name: null, summary: null, value: { message: "Invalid widget" } }],
      headers: [],
      required: false,
    },
  ],
};

describe("operationToMarkdown", () => {
  it("serializes documented operation details as Markdown", () => {
    expect(operationToMarkdown(operation)).toBe(`# Create widget

\`POST /widgets/{widget}\`

Creates a widget.

## Authorization

- bearer (widgets:write) + service-key
- OR
- signed-request

## Parameters

| Name | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| widget | path | string | yes | Widget identifier |
| include | query | string[] | no | Available values: \`roles\`, \`rolesCount\` |

## Request body

**Content-Type:** \`application/json\`

### Schema

\`\`\`json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "example": "Widget"
    }
  }
}
\`\`\`

### Example

\`\`\`json
{}
\`\`\`

## Responses

### 201 application/json

Widget created

#### Headers

| Name | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| X-Request-Id | header | string | no | Correlates the request |

#### Schema

\`\`\`json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "example": "widget_123"
    }
  }
}
\`\`\`

#### Example

\`\`\`json
{
  "id": "widget_123"
}
\`\`\`

### 422 application/json

Validation failed

#### Example

\`\`\`json
{
  "message": "Invalid widget"
}
\`\`\``);
  });

  it("escapes parameter table cells and omits absent sections", () => {
    expect(
      operationToMarkdown({
        ...operation,
        description: null,
        security: [],
        paramGroups: [
          {
            location: "query",
            params: [
              {
                ...operation.paramGroups[1]!.params[0]!,
                name: "filter|status",
                description: "One\ntwo|three",
              },
            ],
          },
        ],
        requests: [],
        responses: [],
      }),
    ).toBe(`# Create widget

\`POST /widgets/{widget}\`

## Parameters

| Name | In | Type | Required | Description |
| --- | --- | --- | --- | --- |
| filter\\|status | query | string[] | no | One<br>two\\|three<br>Available values: \`roles\`, \`rolesCount\` |`);
  });

  it("serializes schema references separately from named and derived examples", () => {
    const components = {
      schemas: {
        WidgetInput: {
          type: "object",
          required: ["name"],
          properties: { name: { type: "string", minLength: 2, example: "Widget" } },
        },
        Widget: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", pattern: "^widget_", example: "widget_123" } },
        },
      },
    };
    const markdown = operationToMarkdown(
      {
        ...operation,
        requests: [
          {
            ...operation.requests[0]!,
            schema: { $ref: "#/components/schemas/WidgetInput" },
            examples: [{ name: "desk", summary: "A desk widget", value: { name: "Desk" } }],
          },
        ],
        responses: [
          {
            ...operation.responses[0]!,
            schema: { $ref: "#/components/schemas/Widget" },
            examples: [],
          },
        ],
      },
      components,
    );

    expect(markdown).toContain("### Schema");
    expect(markdown).toContain('"$ref": "#/components/schemas/WidgetInput"');
    expect(markdown).toContain("### Example: desk");
    expect(markdown).toContain("A desk widget");
    expect(markdown).toContain('"name": "Desk"');
    expect(markdown).toContain("#### Schema");
    expect(markdown).toContain('"$ref": "#/components/schemas/Widget"');
    expect(markdown).toContain("#### Example");
    expect(markdown).toContain('"id": "widget_123"');
  });

  it("serializes example descriptions and external values", () => {
    const markdown = operationToMarkdown({
      ...operation,
      requests: [],
      responses: [
        {
          ...operation.responses[0]!,
          schema: null,
          examples: [
            {
              name: "large",
              summary: "Large payload",
              description: "Stored outside the specification.",
              externalValue: "https://example.test/widgets.json",
              value: undefined,
            },
          ],
        },
      ],
    });

    expect(markdown).toContain("Large payload");
    expect(markdown).toContain("Stored outside the specification.");
    expect(markdown).toContain("[Open external example](https://example.test/widgets.json)");
    expect(markdown).not.toContain("```json\nundefined");
  });

  it("derives minimal request examples while keeping response examples comprehensive", () => {
    const markdown = operationToMarkdown({
      ...operation,
      requests: [
        {
          ...operation.requests[0]!,
          schema: {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string", example: "Widget" },
              note: { type: "string", example: "Optional request note" },
            },
          },
        },
      ],
      responses: [
        {
          ...operation.responses[0]!,
          schema: {
            type: "object",
            properties: {
              id: { type: "string", example: "widget_123" },
              note: { type: "string", example: "Included response note" },
            },
          },
        },
      ],
    });

    expect(markdown).toContain('### Example\n\n```json\n{\n  "name": "Widget"\n}\n```');
    expect(markdown).toContain(
      '#### Example\n\n```json\n{\n  "id": "widget_123",\n  "note": "Included response note"\n}\n```',
    );
  });

  it("preserves component references in schemas", () => {
    const markdown = operationToMarkdown(
      {
        ...operation,
        requests: [],
        responses: [
          {
            ...operation.responses[0]!,
            schema: { $ref: "#/components/schemas/Node" },
            examples: [],
          },
        ],
      },
      {
        schemas: {
          Node: {
            type: "object",
            properties: {
              value: { type: "string", example: "root" },
              child: { $ref: "#/components/schemas/Node" },
            },
          },
        },
      },
    );

    expect(markdown).toContain('"$ref": "#/components/schemas/Node"');
    expect(markdown).not.toContain('"$defs": {');
    expect(markdown).toContain("#### Example");
  });
});

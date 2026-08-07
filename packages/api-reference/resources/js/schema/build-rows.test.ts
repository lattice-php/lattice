import { describe, expect, it } from "vitest";
import { buildSchemaRows } from "./build-rows";

const components = {
  schemas: {
    Node: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "integer" },
        label: { type: ["string", "null"] },
        parent: { $ref: "#/components/schemas/Node" },
      },
    },
  },
};
const nodeSchema = { $ref: "#/components/schemas/Node" };

describe("buildSchemaRows", () => {
  it("maps object properties to rows", () => {
    const rows = buildSchemaRows(nodeSchema, components);
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
    expect(byName.id.typeLabel).toBe("integer");
    expect(byName.id.required).toBe(true);
    expect(byName.label.typeLabel).toContain("string");
    expect(byName.label.required).toBe(false);
  });

  it("terminates on a self-referential schema", () => {
    const rows = buildSchemaRows(nodeSchema, components);
    const parent = rows.find((r) => r.name === "parent");
    expect(parent).toBeDefined();
    expect(parent!.isRecursive).toBe(true);
    expect(parent!.children).toEqual([]);
  });

  it("renders an inline object schema without a top-level $ref", () => {
    const inline = {
      type: "object",
      required: ["data"],
      properties: { data: { $ref: "#/components/schemas/Node" } },
    };
    const rows = buildSchemaRows(inline, components);
    expect(rows.find((r) => r.name === "data")).toBeDefined();
  });

  it("extracts formats, values, validation constraints, and access metadata", () => {
    const rows = buildSchemaRows(
      {
        type: "object",
        properties: {
          id: {
            type: "integer",
            format: "int64",
            minimum: 1,
            maximum: 10,
            default: 5,
            examples: [7],
            deprecated: true,
            readOnly: true,
          },
          status: {
            type: "string",
            enum: ["active", "archived"],
            minLength: 3,
            maxLength: 8,
            pattern: "^[a-z]+$",
          },
          kind: { type: "string", const: "widget", writeOnly: true },
        },
      },
      {},
    );
    const byName = Object.fromEntries(rows.map((row) => [row.name, row]));

    expect(byName.id.details).toEqual([
      "format: int64",
      "default: 5",
      "examples: [7]",
      "minimum: 1",
      "maximum: 10",
      "deprecated",
      "readOnly",
    ]);
    expect(byName.status.details).toEqual([
      'enum: ["active","archived"]',
      "minLength: 3",
      "maxLength: 8",
      'pattern: "^[a-z]+$"',
    ]);
    expect(byName.kind.details).toEqual(['const: "widget"', "writeOnly"]);
  });

  it("merges allOf branches for display", () => {
    const rows = buildSchemaRows(
      {
        type: "object",
        properties: {
          node: {
            allOf: [{ $ref: "#/components/schemas/Node" }, { description: "Overlaid description" }],
          },
        },
      },
      components,
    );
    const node = rows.find((r) => r.name === "node")!;

    expect(node.typeLabel).toBe("object");
    expect(node.description).toBe("Overlaid description");
    const child = Object.fromEntries(node.children.map((r) => [r.name, r]));
    expect(child.id.required).toBe(true);
    expect(child.parent.isRecursive).toBe(true);
  });

  it("unions required and shallow-merges properties across allOf branches", () => {
    const rows = buildSchemaRows(
      {
        type: "object",
        properties: {
          merged: {
            allOf: [
              {
                type: "object",
                required: ["a"],
                properties: { a: { type: "string" }, b: { type: "string" } },
              },
              { type: "object", required: ["b"], properties: { b: { type: "integer" } } },
            ],
          },
        },
      },
      {},
    );
    const merged = Object.fromEntries(rows[0].children.map((r) => [r.name, r]));

    expect(merged.a.required).toBe(true);
    expect(merged.b.required).toBe(true);
    expect(merged.b.typeLabel).toBe("integer");
  });

  it("labels oneOf branches by title, ref name, or type", () => {
    const rows = buildSchemaRows(
      {
        oneOf: [
          { title: "Named branch", type: "object" },
          { $ref: "#/components/schemas/Node" },
          { type: "string" },
        ],
      },
      components,
    );

    expect(rows.map((r) => r.typeLabel)).toEqual(["Named branch", "Node", "string"]);
    expect(rows.every((r) => r.name === null)).toBe(true);
  });

  it("appends null for OpenAPI 3.0 nullable and 3.1 type arrays", () => {
    const rows = buildSchemaRows(
      {
        type: "object",
        properties: {
          legacy: { type: "string", nullable: true },
          modern: { type: ["string", "null"] },
        },
      },
      {},
    );
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]));

    expect(byName.legacy.typeLabel).toBe("string | null");
    expect(byName.modern.typeLabel).toBe("string | null");
  });

  it("renders additionalProperties as a child row", () => {
    const rows = buildSchemaRows(
      {
        type: "object",
        additionalProperties: { type: "string" },
      },
      {},
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("additionalProperties");
    expect(rows[0].typeLabel).toBe("string");
  });

  it("follows a $ref chain to the terminal schema", () => {
    const chained = {
      schemas: {
        Alias: { $ref: "#/components/schemas/Target" },
        Target: { type: "object", properties: { value: { type: "integer" } } },
      },
    };
    const rows = buildSchemaRows({ $ref: "#/components/schemas/Alias" }, chained);

    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("value");
    expect(rows[0].typeLabel).toBe("integer");
  });

  it("degrades unresolvable refs to any without throwing", () => {
    const rows = buildSchemaRows(
      {
        type: "object",
        properties: { external: { $ref: "./other-file.yaml#/Thing" } },
      },
      {},
    );

    expect(rows[0].typeLabel).toBe("any");
    expect(rows[0].children).toEqual([]);
  });
});

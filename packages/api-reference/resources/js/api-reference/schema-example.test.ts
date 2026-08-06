import { describe, expect, it } from "vitest";
import { exampleFromSchema, initialContractExample } from "./schema-example";

describe("exampleFromSchema", () => {
  it("prefers examples, defaults, and enums before type placeholders", () => {
    expect(exampleFromSchema({ type: "string", example: "shown" })).toBe("shown");
    expect(exampleFromSchema({ type: "string", examples: ["first", "second"] })).toBe("first");
    expect(exampleFromSchema({ type: "integer", default: 10 })).toBe(10);
    expect(exampleFromSchema({ type: "string", const: "fixed" })).toBe("fixed");
    expect(exampleFromSchema({ type: "string", enum: ["first", "second"] })).toBe("first");
  });

  it("uses useful placeholders for common string formats", () => {
    expect(exampleFromSchema({ type: "string", format: "email" })).toBe("user@example.com");
    expect(exampleFromSchema({ type: "string", format: "uri" })).toBe("https://example.com");
    expect(exampleFromSchema({ type: "string", format: "uuid" })).toBe(
      "00000000-0000-4000-8000-000000000000",
    );
    expect(exampleFromSchema({ type: "string", format: "date" })).toBe("1970-01-01");
    expect(exampleFromSchema({ type: "string", format: "date-time" })).toBe("1970-01-01T00:00:00Z");
  });

  it("builds nested object and array samples", () => {
    expect(
      exampleFromSchema({
        type: "object",
        properties: {
          name: { type: "string" },
          enabled: { type: "boolean" },
          tags: { type: "array", items: { type: "string" } },
        },
      }),
    ).toEqual({ name: "string", enabled: false, tags: ["string"] });
  });

  it("resolves local component schema references without recursing forever", () => {
    const components = {
      schemas: {
        User: {
          type: "object",
          properties: {
            name: { type: "string" },
            manager: { $ref: "#/components/schemas/User" },
          },
        },
      },
    };

    expect(exampleFromSchema({ $ref: "#/components/schemas/User" }, components)).toEqual({
      name: "string",
      manager: null,
    });
  });

  it("merges object examples from allOf schemas", () => {
    const components = {
      schemas: {
        ProductReference: {
          type: "object",
          properties: {
            id: { type: "string", example: "product-1" },
          },
        },
      },
    };

    expect(
      exampleFromSchema(
        {
          allOf: [
            { $ref: "#/components/schemas/ProductReference" },
            {
              type: "object",
              properties: {
                name: { type: "string", example: "Desk" },
              },
            },
          ],
        },
        components,
      ),
    ).toEqual({ id: "product-1", name: "Desk" });
  });

  it("selects useful non-null variants from union schemas", () => {
    expect(
      exampleFromSchema({
        type: "object",
        properties: {
          status: { anyOf: [{ type: "null" }, { type: "string", enum: ["active"] }] },
          owner: { oneOf: [{ type: "null" }, { type: "string", example: "Ada" }] },
          updatedAt: { type: ["null", "string"], format: "date-time" },
        },
      }),
    ).toEqual({
      status: "active",
      owner: "Ada",
      updatedAt: "1970-01-01T00:00:00Z",
    });
  });

  it("combines local references with sibling object properties", () => {
    const components = {
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 42 },
          },
        },
      },
    };

    expect(
      exampleFromSchema(
        {
          $ref: "#/components/schemas/Product",
          properties: {
            name: { type: "string", example: "Desk" },
          },
        },
        components,
      ),
    ).toEqual({ id: 42, name: "Desk" });
  });
});

describe("initialContractExample", () => {
  it("prefers the first explicit contract example", () => {
    const contract = {
      role: "request" as const,
      status: null,
      mediaType: "application/json",
      schema: { type: "string", example: "schema" },
      title: null,
      examples: [{ name: "named", summary: null, value: { explicit: true } }],
      headers: [],
      required: false,
    };

    expect(initialContractExample(contract)).toEqual({ explicit: true });
  });

  it("falls back to the schema when examples only provide external values", () => {
    const contract = {
      role: "request" as const,
      status: null,
      mediaType: "application/json",
      schema: { type: "string", example: "schema" },
      title: null,
      examples: [
        {
          name: "large",
          summary: null,
          externalValue: "https://example.test/example.json",
          value: undefined,
        },
      ],
      headers: [],
      required: false,
    };

    expect(initialContractExample(contract)).toBe("schema");
  });
});

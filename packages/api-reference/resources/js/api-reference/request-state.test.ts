import { describe, expect, it } from "vitest";
import { operation, parameter, requestContract } from "../test-support";
import {
  initialRequestValues,
  isFileMediaType,
  isJsonMediaType,
  jsonRequestContracts,
  parameterKey,
  sendableRequestContracts,
} from "./request-state";

describe("parameterKey", () => {
  it("combines the parameter location and name into a stable key", () => {
    expect(parameterKey(parameter({ name: "widget id", location: "path" }))).toBe("path:widget id");
  });
});

describe("request JSON media types", () => {
  it("accepts JSON and structured JSON suffixes while ignoring form data", () => {
    expect(isJsonMediaType("application/json")).toBe(true);
    expect(isJsonMediaType("application/problem+json")).toBe(true);
    expect(isJsonMediaType("multipart/form-data")).toBe(false);
    expect(isJsonMediaType(null)).toBe(false);
  });

  it("preserves the order of JSON-compatible request contracts", () => {
    const form = requestContract({ mediaType: "application/x-www-form-urlencoded" });
    const problem = requestContract({ mediaType: "application/problem+json" });
    const json = requestContract({ mediaType: "application/json" });

    expect(jsonRequestContracts(operation([], [form, problem, json]))).toEqual([problem, json]);
  });
});

describe("request file media types", () => {
  it("sends every media type that is neither JSON nor form fields as a file", () => {
    expect(isFileMediaType("application/pdf")).toBe(true);
    expect(isFileMediaType("text/xml; charset=utf-8")).toBe(true);
    expect(isFileMediaType("application/octet-stream")).toBe(true);
    expect(isFileMediaType("application/json")).toBe(false);
    expect(isFileMediaType("multipart/form-data")).toBe(false);
    expect(isFileMediaType("application/x-www-form-urlencoded")).toBe(false);
    expect(isFileMediaType(null)).toBe(false);
  });

  it("offers JSON and file contracts in document order and skips form contracts", () => {
    const pdf = requestContract({ mediaType: "application/pdf" });
    const form = requestContract({ mediaType: "multipart/form-data" });
    const json = requestContract({ mediaType: "application/json" });

    expect(sendableRequestContracts(operation([], [pdf, form, json]))).toEqual([pdf, json]);
  });
});

describe("initialRequestValues", () => {
  it("prefers direct parameter examples, then schema examples, defaults, enums, and finally an empty value", () => {
    const params = [
      parameter({ name: "direct", example: 42, schema: { type: "integer", example: 1 } }),
      parameter({ name: "schema-example", schema: { type: "string", example: "shown" } }),
      parameter({ name: "default", schema: { type: "boolean", default: false } }),
      parameter({
        name: "enum",
        required: true,
        schema: { type: "string", enum: ["active", "disabled"] },
      }),
      parameter({
        name: "array",
        example: ["roles", "rolesCount"],
        schema: { type: "array", items: { type: "string", enum: ["roles", "rolesCount"] } },
      }),
      parameter({ name: "empty", schema: { type: "string" } }),
    ];

    expect(initialRequestValues(operation(params)).parameters).toEqual({
      "query:direct": "42",
      "query:schema-example": "shown",
      "query:default": "false",
      "query:enum": "active",
      "query:array": "roles,rolesCount",
      "query:empty": "",
    });
  });

  it("leaves an optional enum parameter unset so it stays out of the request", () => {
    const params = [
      parameter({ name: "status", schema: { type: "string", enum: ["active", "disabled"] } }),
      parameter({
        name: "documented",
        schema: { type: "string", enum: ["active", "disabled"], example: "disabled" },
      }),
    ];

    expect(initialRequestValues(operation(params)).parameters).toEqual({
      "query:status": "",
      "query:documented": "disabled",
    });
  });

  it("selects the first JSON-compatible contract and pretty-prints its explicit example", () => {
    const values = initialRequestValues(
      operation(
        [],
        [
          requestContract({
            mediaType: "multipart/form-data",
            examples: [{ name: null, summary: null, value: "ignored" }],
          }),
          requestContract({
            mediaType: "application/problem+json",
            examples: [
              { name: "problem", summary: null, value: { title: "Invalid", status: 422 } },
            ],
          }),
          requestContract({
            mediaType: "application/json",
            examples: [{ name: null, summary: null, value: { ignored: true } }],
          }),
        ],
      ),
    );

    expect(values).toEqual({
      parameters: {},
      mediaType: "application/problem+json",
      body: '{\n  "title": "Invalid",\n  "status": 422\n}',
    });
  });

  it("selects a leading file contract without a file", () => {
    const values = initialRequestValues(
      operation([], [requestContract({ mediaType: "application/pdf", schema: null })]),
    );

    expect(values).toEqual({ parameters: {}, mediaType: "application/pdf", body: "", file: null });
  });

  it("pretty-prints a schema-derived example with component references", () => {
    const values = initialRequestValues(
      operation([], [requestContract({ schema: { $ref: "#/components/schemas/Widget" } })]),
      {
        schemas: {
          Widget: {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string", example: "Desk" },
              count: { type: "integer", default: 2 },
            },
          },
        },
      },
    );

    expect(values.body).toBe('{\n  "name": "Desk"\n}');
  });

  it("derives required writable fields from composed request schemas", () => {
    const values = initialRequestValues(
      operation([], [requestContract({ schema: { $ref: "#/components/schemas/CreateOffer" } })]),
      {
        schemas: {
          OfferState: {
            type: "object",
            required: ["status"],
            properties: {
              status: { type: "string", enum: ["draft", "sent"] },
              internalNote: { type: "string", example: "Not sent" },
            },
          },
          CreateOffer: {
            allOf: [
              { $ref: "#/components/schemas/OfferState" },
              {
                type: "object",
                required: ["address", "reference", "id"],
                properties: {
                  address: {
                    type: "object",
                    required: ["city"],
                    properties: {
                      city: { type: "string", example: "Berlin" },
                      street: { type: "string", example: "Optional street" },
                    },
                  },
                  reference: { type: ["string", "null"], default: null },
                  id: { type: "string", readOnly: true, example: "offer-1" },
                  tags: { type: "array", items: { type: "string" } },
                },
              },
            ],
          },
        },
      },
    );

    expect(values.body).toBe(
      '{\n  "status": "draft",\n  "address": {\n    "city": "Berlin"\n  },\n  "reference": null\n}',
    );
  });

  it("returns no selected body when only non-JSON contracts exist", () => {
    expect(
      initialRequestValues(operation([], [requestContract({ mediaType: "multipart/form-data" })])),
    ).toEqual({ parameters: {}, mediaType: null, body: "" });
  });
});

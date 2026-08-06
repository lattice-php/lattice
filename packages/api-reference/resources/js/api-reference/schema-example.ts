import type { Contract } from "./types";
import { isRecord } from "./utils";

const SCHEMA_REF_PREFIX = "#/components/schemas/";

type ExampleScope = "complete" | "request";

export function exampleFromSchema(schema: unknown, components?: unknown): unknown {
  return schemaExample(schema, components, new Set(), "complete");
}

export function initialContractExample(contract: Contract, components?: unknown): unknown {
  return contractExample(contract, components, "complete");
}

export function initialRequestExample(contract: Contract, components?: unknown): unknown {
  return contractExample(contract, components, "request");
}

function contractExample(contract: Contract, components: unknown, scope: ExampleScope): unknown {
  const explicitExample = contract.examples.find((example) => example.value !== undefined);
  if (explicitExample !== undefined) {
    return explicitExample.value;
  }

  return schemaExample(contract.schema, components, new Set(), scope);
}

function schemaExample(
  schema: unknown,
  components: unknown,
  visitedRefs: Set<string>,
  scope: ExampleScope,
): unknown {
  if (!isRecord(schema)) {
    return null;
  }

  const example = schema.example;
  if (example !== undefined) {
    return example;
  }

  if (Array.isArray(schema.examples) && schema.examples.length > 0) {
    return schema.examples[0];
  }

  const defaultValue = schema.default;
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  if (schema.const !== undefined) {
    return schema.const;
  }

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0];
  }

  const examples = [
    referencedExample(schema, components, visitedRefs, scope),
    ...schemaListExamples(schema.allOf, components, visitedRefs, scope),
    unionExample(schema, components, visitedRefs, scope),
    typedExample(schema, components, visitedRefs, scope),
  ];

  return combineExamples(examples);
}

function referencedExample(
  schema: Record<string, unknown>,
  components: unknown,
  visitedRefs: Set<string>,
  scope: ExampleScope,
): unknown {
  const ref = localSchemaRef(schema);
  if (ref === null || visitedRefs.has(ref)) {
    return null;
  }

  const referencedSchema = componentSchema(ref, components);
  if (referencedSchema === null) {
    return null;
  }

  visitedRefs.add(ref);
  const example = schemaExample(referencedSchema, components, visitedRefs, scope);
  visitedRefs.delete(ref);

  return example;
}

function schemaListExamples(
  schemas: unknown,
  components: unknown,
  visitedRefs: Set<string>,
  scope: ExampleScope,
): unknown[] {
  if (!Array.isArray(schemas)) {
    return [];
  }

  return schemas.map((schema) => schemaExample(schema, components, visitedRefs, scope));
}

function unionExample(
  schema: Record<string, unknown>,
  components: unknown,
  visitedRefs: Set<string>,
  scope: ExampleScope,
): unknown {
  const variants = Array.isArray(schema.oneOf) ? schema.oneOf : schema.anyOf;
  if (!Array.isArray(variants)) {
    return null;
  }

  for (const variant of variants) {
    const example = schemaExample(variant, components, visitedRefs, scope);
    if (example !== null) {
      return example;
    }
  }

  return null;
}

function typedExample(
  schema: Record<string, unknown>,
  components: unknown,
  visitedRefs: Set<string>,
  scope: ExampleScope,
): unknown {
  const type = Array.isArray(schema.type)
    ? schema.type.find((candidate) => candidate !== "null")
    : schema.type;

  if (type === "object" || isRecord(schema.properties)) {
    return objectExample(schema.properties, schema.required, components, visitedRefs, scope);
  }

  if (type === "array") {
    return [schemaExample(schema.items, components, visitedRefs, scope)];
  }

  if (type === "string") {
    return stringExample(schema.format);
  }

  if (type === "integer" || type === "number") {
    return 0;
  }

  if (type === "boolean") {
    return false;
  }

  return null;
}

function combineExamples(examples: unknown[]): unknown {
  const objectExamples = examples.filter(isRecord);
  if (objectExamples.length > 0) {
    return Object.assign({}, ...objectExamples);
  }

  return examples.find((example) => example !== null) ?? null;
}

function stringExample(format: unknown): string {
  switch (format) {
    case "email":
      return "user@example.com";
    case "uri":
    case "url":
      return "https://example.com";
    case "uuid":
      return "00000000-0000-4000-8000-000000000000";
    case "date":
      return "1970-01-01";
    case "date-time":
      return "1970-01-01T00:00:00Z";
    default:
      return "string";
  }
}

function localSchemaRef(schema: Record<string, unknown>): string | null {
  if (typeof schema.$ref !== "string" || !schema.$ref.startsWith(SCHEMA_REF_PREFIX)) {
    return null;
  }

  return schema.$ref;
}

function componentSchema(ref: string, components: unknown): unknown | null {
  if (!isRecord(components) || !isRecord(components.schemas)) {
    return null;
  }

  const name = ref.slice(SCHEMA_REF_PREFIX.length);
  if (name === "" || !(name in components.schemas)) {
    return null;
  }

  return components.schemas[name];
}

function objectExample(
  properties: unknown,
  required: unknown,
  components: unknown,
  visitedRefs: Set<string>,
  scope: ExampleScope,
): Record<string, unknown> {
  if (!isRecord(properties)) {
    return {};
  }

  const requiredProperties = new Set(
    Array.isArray(required)
      ? required.filter((name): name is string => typeof name === "string")
      : [],
  );

  return Object.fromEntries(
    Object.entries(properties)
      .filter(
        ([name, propertySchema]) =>
          scope === "complete" ||
          (requiredProperties.has(name) &&
            (!isRecord(propertySchema) || propertySchema.readOnly !== true)),
      )
      .map(([name, propertySchema]) => [
        name,
        schemaExample(propertySchema, components, visitedRefs, scope),
      ]),
  );
}

export type SchemaRow = {
  id: string;
  name: string | null;
  typeLabel: string;
  required: boolean;
  description: string | null;
  details: string[];
  children: SchemaRow[];
  isRecursive: boolean;
};

type Schema = Record<string, unknown>;

const VALIDATION_KEYS = [
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  "minLength",
  "maxLength",
  "pattern",
  "minItems",
  "maxItems",
  "uniqueItems",
  "minProperties",
  "maxProperties",
];

function asSchema(value: unknown): Schema | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Schema)
    : null;
}

function refName(ref: unknown): string | null {
  if (typeof ref !== "string" || !ref.startsWith("#/components/schemas/")) {
    return null;
  }
  return ref.slice("#/components/schemas/".length);
}

function lookupRef(
  ref: unknown,
  components: Schema | null,
): { name: string; schema: Schema } | null {
  const name = refName(ref);
  if (name === null) {
    return null;
  }
  const schemas = asSchema(components?.schemas);
  const target = asSchema(schemas?.[name]);
  return target ? { name, schema: target } : null;
}

function mergeInto(target: Schema, source: Schema): void {
  for (const [key, value] of Object.entries(source)) {
    if (key === "properties") {
      target.properties = { ...asSchema(target.properties), ...asSchema(value) };
    } else if (key === "required") {
      const merged = new Set([
        ...(Array.isArray(target.required) ? target.required : []),
        ...(Array.isArray(value) ? value : []),
      ]);
      target.required = [...merged];
    } else {
      target[key] = value;
    }
  }
}

/**
 * In OpenAPI 3.1 a `$ref` no longer replaces its object: keywords written next to it
 * apply on top of the referenced schema, and the outermost wins. Generators lean on
 * that to describe a property whose type is a shared component.
 */
function resolveSchema(schema: Schema, components: Schema | null, refs: Set<string>): Schema {
  let current = schema;
  let siblings: Schema = {};

  while (current.$ref !== undefined) {
    const resolved = lookupRef(current.$ref, components);
    if (resolved === null) {
      return siblings;
    }
    if (refs.has(resolved.name)) {
      return { ...current, ...siblings };
    }
    refs.add(resolved.name);
    siblings = { ...refSiblings(current), ...siblings };
    current = resolved.schema;
  }

  if (!Array.isArray(current.allOf)) {
    const resolvedSchema = { ...current };
    mergeInto(resolvedSchema, siblings);

    return resolvedSchema;
  }

  const { allOf, ...rest } = current;
  const merged: Schema = {};
  for (const branch of allOf) {
    const branchSchema = asSchema(branch);
    if (branchSchema) {
      mergeInto(merged, resolveSchema(branchSchema, components, refs));
    }
  }
  mergeInto(merged, resolveSchema(rest, components, refs));
  mergeInto(merged, siblings);
  return merged;
}

function refSiblings(schema: Schema): Schema {
  const siblings = { ...schema };
  delete siblings.$ref;

  return siblings;
}

function typeLabel(schema: Schema, components: Schema | null): string {
  const types = Array.isArray(schema.type)
    ? schema.type.filter((t): t is string => typeof t === "string")
    : typeof schema.type === "string"
      ? [schema.type]
      : [];

  if (types.length === 0) {
    if (schema.properties !== undefined || schema.additionalProperties !== undefined) {
      types.push("object");
    } else if (schema.items !== undefined) {
      types.push("array");
    }
  }
  if (schema.nullable === true && !types.includes("null")) {
    types.push("null");
  }

  if (types.length === 0) {
    if (Array.isArray(schema.oneOf)) {
      return "oneOf";
    }
    if (Array.isArray(schema.anyOf)) {
      return "anyOf";
    }
    return "any";
  }

  const items = asSchema(schema.items);
  if (items && types[0] === "array") {
    const itemLabel =
      refName(items.$ref) ?? typeLabel(resolveSchema(items, components, new Set()), components);
    if (itemLabel !== "any" && itemLabel !== "object") {
      types[0] = `array[${itemLabel}]`;
    }
  }

  return types.join(" | ");
}

function branchLabel(branch: Schema, resolved: Schema, components: Schema | null): string {
  if (typeof resolved.title === "string") {
    return resolved.title;
  }
  return refName(branch.$ref) ?? typeLabel(resolved, components);
}

function schemaValue(value: unknown): string {
  return JSON.stringify(value) ?? String(value);
}

function schemaDetails(schema: Schema): string[] {
  const details: string[] = [];

  if (typeof schema.format === "string") {
    details.push(`format: ${schema.format}`);
  }
  if ("const" in schema) {
    details.push(`const: ${schemaValue(schema.const)}`);
  } else if (Array.isArray(schema.enum)) {
    details.push(`enum: ${schemaValue(schema.enum)}`);
  }
  if (schema.default !== undefined) {
    details.push(`default: ${schemaValue(schema.default)}`);
  }
  if (schema.examples !== undefined) {
    details.push(`examples: ${schemaValue(schema.examples)}`);
  }
  for (const [key, value] of Object.entries(schema)) {
    if (VALIDATION_KEYS.includes(key)) {
      details.push(`${key}: ${schemaValue(value)}`);
    }
  }
  if (schema.deprecated === true) {
    details.push("deprecated");
  }
  if (schema.readOnly === true) {
    details.push("readOnly");
  }
  if (schema.writeOnly === true) {
    details.push("writeOnly");
  }

  return details;
}

function pointerSegment(key: string): string {
  return key.replace(/~/g, "~0").replace(/\//g, "~1");
}

function toRow(
  raw: unknown,
  name: string | null,
  id: string,
  required: boolean,
  components: Schema | null,
  ancestors: Set<string>,
): SchemaRow {
  const schema = asSchema(raw) ?? {};
  const refs = new Set<string>();
  const resolved = resolveSchema(schema, components, refs);
  const isRecursive = [...refs].some((ref) => ancestors.has(ref));

  return {
    id,
    name,
    typeLabel: typeLabel(resolved, components),
    required,
    description: typeof resolved.description === "string" ? resolved.description : null,
    details: schemaDetails(resolved),
    children: isRecursive
      ? []
      : childRows(
          resolved,
          id,
          components,
          refs.size > 0 ? new Set([...ancestors, ...refs]) : ancestors,
        ),
    isRecursive,
  };
}

function childRows(
  schema: Schema,
  id: string,
  components: Schema | null,
  ancestors: Set<string>,
): SchemaRow[] {
  const rows: SchemaRow[] = [];
  const required = new Set(Array.isArray(schema.required) ? schema.required : []);

  const properties = asSchema(schema.properties);
  for (const [name, property] of Object.entries(properties ?? {})) {
    rows.push(
      toRow(
        property,
        name,
        `${id}/properties/${pointerSegment(name)}`,
        required.has(name),
        components,
        ancestors,
      ),
    );
  }

  const additional = asSchema(schema.additionalProperties);
  if (additional) {
    rows.push(
      toRow(
        additional,
        "additionalProperties",
        `${id}/additionalProperties`,
        false,
        components,
        ancestors,
      ),
    );
  }

  const items = asSchema(schema.items);
  if (items) {
    const itemRefs = new Set<string>();
    const resolvedItems = resolveSchema(items, components, itemRefs);
    if ([...itemRefs].some((ref) => ancestors.has(ref))) {
      rows.push(toRow(items, null, `${id}/items`, false, components, ancestors));
    } else {
      const itemAncestors = itemRefs.size > 0 ? new Set([...ancestors, ...itemRefs]) : ancestors;
      rows.push(...childRows(resolvedItems, `${id}/items`, components, itemAncestors));
    }
  }

  for (const combiner of ["oneOf", "anyOf"] as const) {
    const branches = schema[combiner];
    if (!Array.isArray(branches)) {
      continue;
    }
    branches.forEach((branch, index) => {
      const branchSchema = asSchema(branch) ?? {};
      const row = toRow(branch, null, `${id}/${combiner}/${index}`, false, components, ancestors);
      row.typeLabel = branchLabel(
        branchSchema,
        resolveSchema(branchSchema, components, new Set()),
        components,
      );
      rows.push(row);
    });
  }

  return rows;
}

export function buildSchemaRows(schema: unknown, components: unknown): SchemaRow[] {
  const root = asSchema(schema);
  if (root === null) {
    return [];
  }
  const componentsSchema = asSchema(components);
  const refs = new Set<string>();
  const resolved = resolveSchema(root, componentsSchema, refs);

  return childRows(resolved, "#", componentsSchema, refs);
}

import { useId, useMemo, useState } from "react";
import { FormFieldFrame } from "@lattice-php/form";
import { Button, InfoTooltip, Input, NativeSelect, Textarea } from "@lattice-php/ui";
import { exampleFromSchema } from "./schema-example";
import { isRecord, prettyJson } from "./utils";

type Scalar = string | number | boolean;

type FieldSchema =
  | {
      kind: "object";
      description: string | null;
      tooltip: string | null;
      initialValue: unknown;
      properties: Array<{ name: string; required: boolean; schema: FieldSchema }>;
    }
  | {
      kind: "array";
      description: string | null;
      tooltip: string | null;
      initialValue: unknown;
      items: FieldSchema;
    }
  | {
      kind: "json";
      description: string | null;
      tooltip: string | null;
      initialValue: unknown;
    }
  | {
      kind: "string" | "number" | "integer" | "boolean";
      description: string | null;
      tooltip: string | null;
      initialValue: unknown;
      enumValues: Scalar[];
      format: string | null;
      minimum: number | null;
      maximum: number | null;
      multipleOf: number | null;
      minLength: number | null;
      maxLength: number | null;
      pattern: string | null;
    };

type Path = Array<string | number>;

export function RequestBodyEditor({
  idPrefix,
  schema,
  components,
  value,
  required,
  error,
  onChange,
}: {
  idPrefix: string;
  schema: unknown;
  components: unknown;
  value: string;
  required: boolean;
  error?: string;
  onChange: (value: string) => void;
}): React.ReactNode {
  const fieldSchema = useMemo(
    () => normalizeFieldSchema(schema, components, new Set()),
    [components, schema],
  );
  const parsed = parseJson(value);

  if (fieldSchema?.kind !== "object" || !isRecord(parsed)) {
    return (
      <FormFieldFrame
        id={`${idPrefix}-request-body`}
        label="JSON body"
        required={required}
        error={error}
      >
        {(controlProps) => (
          <Textarea
            {...controlProps}
            value={value}
            required={required}
            data-field-key="body"
            onChange={(event) => onChange(event.target.value)}
            className="min-h-40 font-mono"
          />
        )}
      </FormFieldFrame>
    );
  }

  const parsedBody = parsed;

  function update(path: Path, nextValue: unknown): void {
    onChange(prettyJson(updateValue(parsedBody, path, nextValue)));
  }

  return (
    <fieldset aria-label="JSON body fields" className="@container flex min-w-0 flex-col gap-3">
      {error ? <p className="text-sm text-lt-danger">{error}</p> : null}
      <ObjectFields schema={fieldSchema} path={[]} value={parsedBody} onChange={update} />
    </fieldset>
  );
}

function ObjectFields({
  schema,
  path,
  value,
  onChange,
}: {
  schema: Extract<FieldSchema, { kind: "object" }>;
  path: Path;
  value: unknown;
  onChange: (path: Path, value: unknown) => void;
}): React.ReactNode {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 @xl:grid-cols-2">
      {schema.properties.map((property) => (
        <BodyField
          key={property.name}
          schema={property.schema}
          path={[...path, property.name]}
          required={property.required}
          value={isRecord(value) ? value[property.name] : undefined}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function BodyField({
  schema,
  path,
  required,
  value,
  onChange,
}: {
  schema: FieldSchema;
  path: Path;
  required: boolean;
  value: unknown;
  onChange: (path: Path, value: unknown) => void;
}): React.ReactNode {
  const id = `body-${useId().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`;

  if (schema.kind === "object") {
    return (
      <fieldset className="min-w-0 rounded-lt-sm border border-lt-border p-3 @xl:col-span-2">
        <legend className="px-1 text-xs font-semibold text-lt-muted-fg">
          {pathLabel(path)}
          {required ? <span className="text-lt-danger"> *</span> : null}
          <InfoTooltip content={schema.tooltip} />
        </legend>
        {schema.description ? (
          <p className="mb-3 text-xs text-lt-muted-fg">{schema.description}</p>
        ) : null}
        <ObjectFields schema={schema} path={path} value={value} onChange={onChange} />
      </fieldset>
    );
  }

  if (schema.kind === "array") {
    const items = Array.isArray(value) ? value : [];

    return (
      <fieldset className="flex min-w-0 flex-col gap-3 rounded-lt-sm border border-lt-border p-3 @xl:col-span-2">
        <legend className="px-1 text-xs font-semibold text-lt-muted-fg">
          {pathLabel(path)}
          {required ? <span className="text-lt-danger"> *</span> : null}
          <InfoTooltip content={schema.tooltip} />
        </legend>
        {schema.description ? (
          <p className="text-xs text-lt-muted-fg">{schema.description}</p>
        ) : null}
        {items.map((item, index) => (
          <div key={index} className="flex min-w-0 items-start gap-3">
            <div className="min-w-0 flex-1">
              <BodyField
                schema={schema.items}
                path={[...path, index]}
                required
                value={item}
                onChange={onChange}
              />
            </div>
            <Button
              type="button"
              emphasis="outline"
              variant="danger"
              size="sm"
              aria-label={`Remove ${pathLabel([...path, index])}`}
              onClick={() =>
                onChange(
                  path,
                  items.filter((_item, itemIndex) => itemIndex !== index),
                )
              }
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          emphasis="outline"
          size="sm"
          className="self-start"
          aria-label={`Add ${pathLabel(path)} item`}
          onClick={() => onChange(path, [...items, initialValue(schema.items)])}
        >
          Add item
        </Button>
      </fieldset>
    );
  }

  if (schema.kind === "json") {
    return (
      <JsonField
        schema={schema}
        path={path}
        required={required}
        value={value}
        onChange={onChange}
      />
    );
  }

  const label = pathLabel(path);

  return (
    <FormFieldFrame
      id={id}
      label={label}
      required={required}
      helperText={schema.description ?? undefined}
      tooltip={schema.tooltip ?? undefined}
      className="min-w-0"
    >
      {(controlProps) =>
        schema.enumValues.length > 0 ? (
          <NativeSelect
            {...controlProps}
            value={encodeScalar(value)}
            required={required}
            data-field-key={`body:${label}`}
            onChange={(event) => {
              const selected = schema.enumValues.find(
                (option) => encodeScalar(option) === event.target.value,
              );
              onChange(path, event.target.value === "" && !required ? undefined : selected);
            }}
          >
            {!required ? <option value="">Not set</option> : null}
            {schema.enumValues.map((option) => (
              <option key={encodeScalar(option)} value={encodeScalar(option)}>
                {String(option)}
              </option>
            ))}
          </NativeSelect>
        ) : schema.kind === "boolean" ? (
          <NativeSelect
            {...controlProps}
            value={typeof value === "boolean" ? String(value) : ""}
            required={required}
            data-field-key={`body:${label}`}
            onChange={(event) =>
              onChange(path, event.target.value === "" ? undefined : event.target.value === "true")
            }
          >
            {!required ? <option value="">Not set</option> : null}
            <option value="true">true</option>
            <option value="false">false</option>
          </NativeSelect>
        ) : (
          <Input
            {...controlProps}
            type={inputType(schema)}
            value={typeof value === "string" || typeof value === "number" ? value : ""}
            required={required}
            min={schema.minimum ?? undefined}
            max={schema.maximum ?? undefined}
            step={inputStep(schema)}
            minLength={schema.minLength ?? undefined}
            maxLength={schema.maxLength ?? undefined}
            pattern={schema.pattern ?? undefined}
            data-field-key={`body:${label}`}
            onChange={(event) => {
              const input = event.target.value;
              onChange(
                path,
                input === "" && !required
                  ? undefined
                  : schema.kind === "number" || schema.kind === "integer"
                    ? input === ""
                      ? ""
                      : Number(input)
                    : input,
              );
            }}
          />
        )
      }
    </FormFieldFrame>
  );
}

function JsonField({
  schema,
  path,
  required,
  value,
  onChange,
}: {
  schema: Extract<FieldSchema, { kind: "json" }>;
  path: Path;
  required: boolean;
  value: unknown;
  onChange: (path: Path, value: unknown) => void;
}): React.ReactNode {
  const id = `body-${useId().replaceAll(/[^a-zA-Z0-9_-]/g, "")}`;
  const label = pathLabel(path);
  const serialized = prettyJson(value);
  const [emitted, setEmitted] = useState(serialized);
  const [draft, setDraft] = useState(serialized);

  if (emitted !== serialized) {
    setEmitted(serialized);
    setDraft(serialized);
  }

  return (
    <FormFieldFrame
      id={id}
      label={label}
      required={required}
      helperText={schema.description ?? undefined}
      tooltip={schema.tooltip ?? undefined}
      error={parseJsonField(draft).valid ? undefined : "Enter valid JSON."}
      className="min-w-0 @xl:col-span-2"
    >
      {(controlProps) => (
        <Textarea
          {...controlProps}
          value={draft}
          required={required}
          data-field-key={`body:${label}`}
          className="min-h-24 font-mono"
          onChange={(event) => {
            setDraft(event.target.value);

            const parsed = parseJsonField(event.target.value);
            if (!parsed.valid) {
              return;
            }

            setEmitted(prettyJson(parsed.value));
            onChange(path, parsed.value);
          }}
        />
      )}
    </FormFieldFrame>
  );
}

function parseJsonField(text: string): { valid: boolean; value: unknown } {
  if (text.trim() === "") {
    return { valid: true, value: undefined };
  }

  try {
    return { valid: true, value: JSON.parse(text) as unknown };
  } catch {
    return { valid: false, value: undefined };
  }
}

function normalizeFieldSchema(
  schema: unknown,
  components: unknown,
  visitedRefs: Set<string>,
): FieldSchema | null {
  if (!isRecord(schema)) {
    return null;
  }

  if (typeof schema.$ref === "string") {
    if (!schema.$ref.startsWith("#/components/schemas/") || visitedRefs.has(schema.$ref)) {
      return null;
    }

    const referenced = componentSchema(schema.$ref, components);
    if (referenced === null) {
      return null;
    }

    const normalized = normalizeFieldSchema(
      referenced,
      components,
      new Set([...visitedRefs, schema.$ref]),
    );

    return normalized === null
      ? null
      : {
          ...normalized,
          description: stringValue(schema.description) ?? normalized.description,
          tooltip: tooltipValue(schema) ?? normalized.tooltip,
          initialValue: exampleFromSchema(schema, components),
        };
  }

  const nullableBranch = nullableUnionBranch(schema);
  if (nullableBranch !== null) {
    const normalized = normalizeFieldSchema(nullableBranch, components, visitedRefs);

    return normalized === null
      ? null
      : {
          ...normalized,
          description: stringValue(schema.description) ?? normalized.description,
          tooltip: tooltipValue(schema) ?? normalized.tooltip,
          initialValue: exampleFromSchema(schema, components),
        };
  }

  if ("oneOf" in schema || "anyOf" in schema) {
    return null;
  }

  if (Array.isArray(schema.allOf)) {
    const parts = schema.allOf.map((part) => normalizeFieldSchema(part, components, visitedRefs));
    const own = normalizeObjectProperties(schema, components, visitedRefs);

    if (parts.some((part) => part?.kind !== "object") || own === null) {
      return null;
    }

    return mergeObjects(
      [...(parts as Array<Extract<FieldSchema, { kind: "object" }>>), own],
      schema,
      components,
    );
  }

  const type = schemaType(schema);
  if (type === "object" || isRecord(schema.properties)) {
    return normalizeObjectProperties(schema, components, visitedRefs);
  }

  if (type === "array") {
    const items = normalizeFieldSchema(schema.items, components, visitedRefs);

    return items === null
      ? null
      : {
          kind: "array",
          description: stringValue(schema.description),
          tooltip: tooltipValue(schema),
          initialValue: exampleFromSchema(schema, components),
          items,
        };
  }

  if (!isScalarKind(type)) {
    return null;
  }

  const enumValues = Array.isArray(schema.enum) && schema.enum.every(isScalar) ? schema.enum : [];

  if (Array.isArray(schema.enum) && enumValues.length !== schema.enum.length) {
    return null;
  }

  return {
    kind: type,
    description: stringValue(schema.description),
    tooltip: tooltipValue(schema),
    initialValue: exampleFromSchema(schema, components),
    enumValues,
    format: stringValue(schema.format),
    minimum: numberValue(schema.minimum),
    maximum: numberValue(schema.maximum),
    multipleOf: numberValue(schema.multipleOf),
    minLength: numberValue(schema.minLength),
    maxLength: numberValue(schema.maxLength),
    pattern: stringValue(schema.pattern),
  };
}

function normalizeObjectProperties(
  schema: Record<string, unknown>,
  components: unknown,
  visitedRefs: Set<string>,
): Extract<FieldSchema, { kind: "object" }> | null {
  if (schema.additionalProperties === true || isRecord(schema.additionalProperties)) {
    return null;
  }

  const properties = isRecord(schema.properties) ? schema.properties : {};
  const required = new Set(
    Array.isArray(schema.required)
      ? schema.required.filter((name): name is string => typeof name === "string")
      : [],
  );
  const normalizedProperties: Array<{ name: string; required: boolean; schema: FieldSchema }> = [];

  for (const [name, propertySchema] of Object.entries(properties)) {
    if (isRecord(propertySchema) && propertySchema.readOnly === true) {
      continue;
    }

    const normalized =
      normalizeFieldSchema(propertySchema, components, visitedRefs) ??
      rawJsonFieldSchema(propertySchema, components);

    normalizedProperties.push({
      name,
      required: required.has(name) && !isNullableSchema(propertySchema),
      schema: normalized,
    });
  }

  return {
    kind: "object",
    description: stringValue(schema.description),
    tooltip: tooltipValue(schema),
    initialValue: exampleFromSchema(schema, components),
    properties: normalizedProperties,
  };
}

function rawJsonFieldSchema(
  schema: unknown,
  components: unknown,
): Extract<FieldSchema, { kind: "json" }> {
  return {
    kind: "json",
    description: isRecord(schema) ? stringValue(schema.description) : null,
    tooltip: isRecord(schema) ? tooltipValue(schema) : null,
    initialValue: exampleFromSchema(schema, components),
  };
}

function nullableUnionBranch(schema: Record<string, unknown>): unknown {
  const branches = Array.isArray(schema.oneOf) ? schema.oneOf : schema.anyOf;
  if (!Array.isArray(branches)) {
    return null;
  }

  const valueBranches = branches.filter((branch) => !isNullSchema(branch));

  return valueBranches.length === 1 && valueBranches.length < branches.length
    ? valueBranches[0]
    : null;
}

function isNullSchema(schema: unknown): boolean {
  return isRecord(schema) && schema.type === "null";
}

function isNullableSchema(schema: unknown): boolean {
  return isRecord(schema) && nullableUnionBranch(schema) !== null;
}

function mergeObjects(
  objects: Array<Extract<FieldSchema, { kind: "object" }>>,
  schema: Record<string, unknown>,
  components: unknown,
): Extract<FieldSchema, { kind: "object" }> {
  const properties = new Map<string, { name: string; required: boolean; schema: FieldSchema }>();

  for (const object of objects) {
    for (const property of object.properties) {
      const current = properties.get(property.name);
      properties.set(property.name, {
        ...property,
        required: property.required || current?.required === true,
      });
    }
  }

  return {
    kind: "object",
    description:
      stringValue(schema.description) ??
      objects.find((object) => object.description)?.description ??
      null,
    tooltip: tooltipValue(schema) ?? objects.find((object) => object.tooltip)?.tooltip ?? null,
    initialValue: exampleFromSchema(schema, components),
    properties: [...properties.values()],
  };
}

function initialValue(schema: FieldSchema): unknown {
  if (schema.initialValue !== null && schema.initialValue !== undefined) {
    return structuredClone(schema.initialValue);
  }

  switch (schema.kind) {
    case "object":
      return {};
    case "array":
      return [];
    case "json":
      return null;
    case "boolean":
      return false;
    case "number":
    case "integer":
      return 0;
    case "string":
      return "";
  }
}

function updateValue(
  root: Record<string, unknown>,
  path: Path,
  value: unknown,
): Record<string, unknown> {
  const next = structuredClone(root);
  let current: Record<string, unknown> | unknown[] = next;

  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index];
    const following = path[index + 1];
    const child = containerValue(current, segment);

    if (!isRecord(child) && !Array.isArray(child)) {
      setContainerValue(current, segment, typeof following === "number" ? [] : {});
    }

    current = containerValue(current, segment) as Record<string, unknown> | unknown[];
  }

  const last = path[path.length - 1];
  if (last === undefined) {
    return isRecord(value) ? value : next;
  }

  if (value === undefined) {
    if (Array.isArray(current) && typeof last === "number") {
      current.splice(last, 1);
    } else if (!Array.isArray(current)) {
      delete current[String(last)];
    }
  } else {
    setContainerValue(current, last, value);
  }

  return next;
}

function containerValue(
  container: Record<string, unknown> | unknown[],
  key: string | number,
): unknown {
  if (Array.isArray(container)) {
    return typeof key === "number" ? container[key] : undefined;
  }

  return container[String(key)];
}

function setContainerValue(
  container: Record<string, unknown> | unknown[],
  key: string | number,
  value: unknown,
): void {
  if (Array.isArray(container)) {
    if (typeof key === "number") {
      container[key] = value;
    }

    return;
  }

  container[String(key)] = value;
}

function parseJson(value: string): unknown {
  try {
    return value.trim() === "" ? {} : JSON.parse(value);
  } catch {
    return null;
  }
}

function pathLabel(path: Path): string {
  return path.reduce<string>(
    (label, segment) =>
      typeof segment === "number"
        ? `${label}[${segment}]`
        : label === ""
          ? segment
          : `${label}.${segment}`,
    "",
  );
}

function componentSchema(ref: string, components: unknown): unknown | null {
  if (!isRecord(components) || !isRecord(components.schemas)) {
    return null;
  }

  const name = ref.slice("#/components/schemas/".length);

  return name in components.schemas ? components.schemas[name] : null;
}

function schemaType(schema: Record<string, unknown>): unknown {
  return Array.isArray(schema.type)
    ? schema.type.find((candidate) => candidate !== "null")
    : schema.type;
}

function inputType(
  schema: Extract<FieldSchema, { kind: "string" | "number" | "integer" | "boolean" }>,
): React.HTMLInputTypeAttribute {
  if (schema.kind === "number" || schema.kind === "integer") {
    return "number";
  }

  switch (schema.format) {
    case "email":
      return "email";
    case "uri":
    case "url":
      return "url";
    case "date":
      return "date";
    case "password":
      return "password";
    default:
      return "text";
  }
}

function inputStep(
  schema: Extract<FieldSchema, { kind: "string" | "number" | "integer" | "boolean" }>,
): number | "any" | undefined {
  if (schema.multipleOf !== null) {
    return schema.multipleOf;
  }

  return schema.kind === "integer" ? 1 : schema.kind === "number" ? "any" : undefined;
}

function encodeScalar(value: unknown): string {
  return isScalar(value) ? `${typeof value}:${String(value)}` : "";
}

function isScalarKind(value: unknown): value is "string" | "number" | "integer" | "boolean" {
  return typeof value === "string" && ["string", "number", "integer", "boolean"].includes(value);
}

function isScalar(value: unknown): value is Scalar {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function tooltipValue(schema: Record<string, unknown>): string | null {
  return stringValue(schema["x-tooltip"]);
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

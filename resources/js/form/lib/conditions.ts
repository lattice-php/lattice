import type { Condition, Op } from "@lattice-php/lattice/types/generated";

export type { Condition };

export type FieldConditions = {
  visible?: Condition[];
  required?: Condition[];
  readOnly?: Condition[];
  disabled?: Condition[];
};

type FieldFlags = {
  hidden?: boolean;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
};

export type FieldState = {
  hidden: boolean;
  required: boolean;
  readOnly: boolean;
  disabled: boolean;
};

export function conditionFields(conditions: FieldConditions | undefined | null): string[] {
  const fields = new Set<string>();

  for (const group of [
    conditions?.visible,
    conditions?.required,
    conditions?.readOnly,
    conditions?.disabled,
  ]) {
    for (const condition of group ?? []) {
      fields.add(condition.field);
    }
  }

  return Array.from(fields);
}

const BOOLEAN_TRUE_VALUES = new Set(["1", "true", "on", "yes"]);

// Mirrors PHP filter_var(FILTER_VALIDATE_BOOLEAN) so conditions evaluate
// identically on the server and the client.
export function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return BOOLEAN_TRUE_VALUES.has(String(value).toLowerCase());
}

function equals(actual: unknown, expected: unknown): boolean {
  if (typeof expected === "boolean") {
    return toBoolean(actual) === expected;
  }
  return String(actual ?? "") === String(expected ?? "");
}

function isIn(actual: unknown, expected: unknown): boolean {
  const needles = (Array.isArray(expected) ? expected : [expected]).map((value) => String(value));
  return needles.includes(String(actual ?? ""));
}

function isBlank(value: unknown): boolean {
  return value == null || String(value).trim() === "";
}

// Null when either value can't be parsed, so before/after never matches a bad date. Mirrors PHP strtotime.
function compareDates(actual: unknown, expected: unknown): number | null {
  const left = Date.parse(String(actual));
  const right = Date.parse(String(expected));

  if (Number.isNaN(left) || Number.isNaN(right)) {
    return null;
  }

  return left === right ? 0 : left < right ? -1 : 1;
}

// Unknown operators from untrusted payloads fail open (the condition matches).
// The `never` parameter makes an Op value added without a case above a
// compile error rather than a silent fall-through.
function evaluateUnknownOperator(_operator: never): boolean {
  return true;
}

function evaluateOp(operator: Op, actual: unknown, expected: unknown): boolean {
  switch (operator) {
    case "eq":
      return equals(actual, expected);
    case "neq":
      return !equals(actual, expected);
    case "gt":
      return Number(actual) > Number(expected);
    case "lt":
      return Number(actual) < Number(expected);
    case "gte":
      return Number(actual) >= Number(expected);
    case "lte":
      return Number(actual) <= Number(expected);
    case "contains":
      return String(actual ?? "").includes(String(expected ?? ""));
    case "starts_with":
      return String(actual ?? "").startsWith(String(expected ?? ""));
    case "ends_with":
      return String(actual ?? "").endsWith(String(expected ?? ""));
    case "in":
      return isIn(actual, expected);
    case "not_in":
      return !isIn(actual, expected);
    case "before":
      return compareDates(actual, expected) === -1;
    case "after":
      return compareDates(actual, expected) === 1;
    case "empty":
      return isBlank(actual);
    case "filled":
      return !isBlank(actual);
    default:
      return evaluateUnknownOperator(operator);
  }
}

function allMatch(conditions: Condition[], values: Record<string, unknown>): boolean {
  return conditions.every((condition) =>
    evaluateOp(condition.operator, values[condition.field], condition.value),
  );
}

function anyMatch(conditions: Condition[] | undefined, values: Record<string, unknown>): boolean {
  return Boolean(
    conditions?.some((condition) =>
      evaluateOp(condition.operator, values[condition.field], condition.value),
    ),
  );
}

export function evaluateConditions(
  conditions: FieldConditions | undefined,
  values: Record<string, unknown>,
  flags: FieldFlags,
): FieldState {
  const visible = !conditions?.visible?.length || allMatch(conditions.visible, values);

  return {
    hidden: Boolean(flags.hidden) || !visible,
    required: Boolean(flags.required) || anyMatch(conditions?.required, values),
    readOnly: Boolean(flags.readOnly) || anyMatch(conditions?.readOnly, values),
    disabled: Boolean(flags.disabled) || anyMatch(conditions?.disabled, values),
  };
}

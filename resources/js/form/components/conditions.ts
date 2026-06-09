export type Condition = { field: string; operator: string; value: unknown };

export type FieldConditions = {
  visible?: Condition[];
  required?: Condition[];
  readonly?: Condition[];
  disabled?: Condition[];
};

export type FieldFlags = {
  hidden?: boolean;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
};

export type FieldState = {
  hidden: boolean;
  required: boolean;
  readonly: boolean;
  disabled: boolean;
};

const BOOLEAN_TRUE_VALUES = new Set(["1", "true", "on", "yes"]);

// Mirrors PHP filter_var(FILTER_VALIDATE_BOOLEAN) so conditions evaluate
// identically on the server and the client.
function toBoolean(value: unknown): boolean {
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

function contains(actual: unknown, expected: unknown): boolean {
  const needles = (Array.isArray(expected) ? expected : [expected]).map((value) => String(value));
  return needles.includes(String(actual ?? ""));
}

function evaluateOp(operator: string, actual: unknown, expected: unknown): boolean {
  switch (operator) {
    case "=":
      return equals(actual, expected);
    case "!=":
      return !equals(actual, expected);
    case ">":
      return Number(actual) > Number(expected);
    case "<":
      return Number(actual) < Number(expected);
    case ">=":
      return Number(actual) >= Number(expected);
    case "<=":
      return Number(actual) <= Number(expected);
    case "in":
      return contains(actual, expected);
    case "not_in":
      return !contains(actual, expected);
    default:
      return true;
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
    readonly: Boolean(flags.readonly) || anyMatch(conditions?.readonly, values),
    disabled: Boolean(flags.disabled) || anyMatch(conditions?.disabled, values),
  };
}

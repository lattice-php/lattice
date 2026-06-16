export function pathParts(path: string): string[] {
  return path.split(".").filter((part) => part !== "");
}

export function appendPath(
  base: string | null | undefined,
  ...parts: Array<string | number>
): string {
  const suffix = parts.map(String).filter((part) => part !== "");

  return [base ?? "", ...suffix].filter((part) => part !== "").join(".");
}

export function toHtmlName(path: string): string {
  const [head, ...tail] = pathParts(path);

  return tail.reduce((name, part) => `${name}[${part}]`, head ?? "");
}

export function getPath(values: Record<string, unknown>, path: string): unknown {
  let current: unknown = values;

  for (const part of pathParts(path)) {
    if (current == null) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function emptyContainer(nextPart: string | undefined): Record<string, unknown> | unknown[] {
  return nextPart !== undefined && /^\d+$/.test(nextPart) ? [] : {};
}

export function setPath(
  values: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const parts = pathParts(path);

  if (parts.length === 0) {
    return values;
  }

  const write = (current: unknown, index: number): unknown => {
    const part = parts[index];
    const last = index === parts.length - 1;
    const source =
      current && typeof current === "object" ? current : emptyContainer(parts[index + 1]);
    const next = Array.isArray(source) ? [...source] : { ...(source as Record<string, unknown>) };

    (next as Record<string, unknown>)[part] = last
      ? value
      : write((source as Record<string, unknown>)[part], index + 1);

    return next;
  };

  return write(values, 0) as Record<string, unknown>;
}

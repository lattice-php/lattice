export function fieldDomName(name: string, prefix?: string): string {
  if (!prefix) {
    return name;
  }

  const suffix = name.replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");

  return suffix ? `${prefix}-${suffix}` : prefix;
}

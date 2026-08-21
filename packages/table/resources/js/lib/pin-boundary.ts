export type PinBoundary = "start" | "end";

export function pinBoundaryClassName(boundary: PinBoundary | undefined): string | undefined {
  if (boundary === "end") {
    return "md:border-e md:border-lt-border";
  }

  if (boundary === "start") {
    return "md:border-s md:border-lt-border";
  }

  return undefined;
}

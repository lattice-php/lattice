import type { BlockPath } from "./tree";

export function encodePath(path: BlockPath): string {
  return path
    .map((step) => (step.slot === undefined ? String(step.index) : `${step.index}.${step.slot}`))
    .join(".");
}

export function decodePath(id: string): BlockPath {
  const parts = id.split(".");
  const path: BlockPath = [];

  for (let i = 0; i < parts.length; ) {
    const index = Number(parts[i]);

    if (i + 1 < parts.length && Number.isNaN(Number(parts[i + 1]))) {
      path.push({ index, slot: parts[i + 1] });
      i += 2;
    } else {
      path.push({ index });
      i += 1;
    }
  }

  return path;
}

export function resolveMove(activeId: string, overId: string): { from: BlockPath; to: BlockPath } {
  return { from: decodePath(activeId), to: decodePath(overId) };
}

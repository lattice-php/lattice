import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// The default 1000ms waitFor timeout flakes under CI's coverage-instrumented,
// parallel load — async event→fetch→re-render chains occasionally need longer.
configure({ testIdAttribute: "data-test", asyncUtilTimeout: 3000 });

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    disconnect() {}

    observe() {}

    unobserve() {}
  };
}

// jsdom implements getClientRects on Element but not on Range. ProseMirror's
// coordsAtPos builds a text Range and calls it, so every TipTap transaction that
// scrolls the selection throws asynchronously — tests still pass, but Vitest
// exits non-zero on the unhandled error. An empty list is enough: ProseMirror
// falls back to getBoundingClientRect when there are no rects.
if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = (): DOMRectList =>
    Object.assign([], { item: () => null }) as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = (): DOMRect => new DOMRect();
}

afterEach(() => {
  cleanup();
});

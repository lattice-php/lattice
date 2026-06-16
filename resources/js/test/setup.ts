import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Allow @testing-library/dom's `jestFakeTimersAreEnabled()` to detect vitest
// fake timers. Without this, `waitFor` uses a fake `setTimeout(resolve, 0)`
// inside its async wrapper that never fires when fake timers are active.
// See: https://github.com/testing-library/dom-testing-library/blob/main/src/helpers.ts
// @ts-expect-error — jest is not declared as a global in this project
globalThis.jest = vi;

configure({ testIdAttribute: "data-test" });

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    disconnect() {}

    observe() {}

    unobserve() {}
  };
}

afterEach(() => {
  cleanup();
});

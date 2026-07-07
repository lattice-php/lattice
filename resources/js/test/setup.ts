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

afterEach(() => {
  cleanup();
});

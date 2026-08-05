import "@testing-library/jest-dom/vitest";
import { setRequestHeaderProvider } from "@lattice-php/core/headers";
import { localeHeader } from "@lattice-php/ui/i18n/locale";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

setRequestHeaderProvider(localeHeader);
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

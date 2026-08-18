import type { ReactElement } from "react";
import { render, type ComponentRenderOptions } from "vitest-browser-react";
import type { Registry } from "./registry";
import { RegistryProvider } from "./registry-context";

/**
 * Browser-mode analog of test-support's `renderWithRegistry`. Lives in its own
 * module because it imports vitest-browser-react, which jsdom suites must
 * never load — import this only from `*.browser.test.*` files.
 */
export function renderWithRegistry(
  ui: ReactElement,
  registry: Registry,
  options?: ComponentRenderOptions,
) {
  return render(ui, {
    ...options,
    wrapper: ({ children }) => <RegistryProvider registry={registry}>{children}</RegistryProvider>,
  });
}

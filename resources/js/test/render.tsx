import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import type { Registry } from "@lattice-php/lattice/core/registry";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";

/**
 * Renders `ui` with `registry` available to <Renderer>/<RenderNode>, mirroring
 * what <Provider> does in the app. Use when a test needs a custom registry
 * (probe components, a subset of built-ins) rather than the default one.
 */
export function renderWithRegistry(
  ui: ReactElement,
  registry: Registry,
  options?: RenderOptions,
): RenderResult {
  return render(
    <RegistryContext.Provider value={registry}>{ui}</RegistryContext.Provider>,
    options,
  );
}

import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";
import type { Registry } from "./registry";
import { RegistryContext } from "./registry-context";
import type { ComponentPropsOf, Node, Schema } from "./types";

/**
 * Build a node fixture for tests with only the props a case cares about. The wire
 * always carries the full prop object, but component reads default what's omitted,
 * so partial props are safe here. Prop names stay checked against the node's
 * generated type via `Partial<ComponentPropsOf<T>>`.
 */
export function fakeNode<TType extends string>(node: {
  type: TType;
  id?: string;
  key?: string;
  schema?: Schema;
  props?: Partial<ComponentPropsOf<TType>>;
}): Node<TType> {
  return node as unknown as Node<TType>;
}

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
  return render(ui, {
    wrapper: ({ children }) => (
      <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>
    ),
    ...options,
  });
}

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

/**
 * Stubs `matchMedia` for jsdom, which does not implement it. `matches` may be a
 * constant or a per-query predicate. The root vitest config unstubs globals
 * between tests, so no manual restore is needed.
 */
export function stubMatchMedia(matches: boolean | ((query: string) => boolean) = false): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn<(query: string) => MediaQueryList>().mockImplementation(
      (query: string) =>
        ({
          matches: typeof matches === "function" ? matches(query) : matches,
          media: query,
          onchange: null,
          addEventListener: vi.fn<() => void>(),
          removeEventListener: vi.fn<() => void>(),
          addListener: vi.fn<() => void>(),
          removeListener: vi.fn<() => void>(),
          dispatchEvent: vi.fn<(event: Event) => boolean>(() => true),
        }) as unknown as MediaQueryList,
    ),
  );
}

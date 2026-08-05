import type { ReactNode } from "react";
import { vi } from "vitest";

/**
 * The slice of `@inertiajs/react` the tree renderer touches — `router.visit`
 * (Enter/Space on a linked node) and `Link` (an href label). Use inside a mock
 * factory: `vi.mock("@inertiajs/react", async () => (await import("./inertia-mock")).inertiaMock())`.
 *
 * This lives apart from `test-support` on purpose: a `vi.mock` factory runs
 * before the mock is installed, so it must not reach a module that imports
 * `tree.tsx` — that would load the real router into the renderer.
 */
export function inertiaMock(): Record<string, unknown> {
  return {
    Link: ({ children, ...rest }: { children?: ReactNode }) => <a {...rest}>{children}</a>,
    router: {
      visit: vi.fn<(url: string, options?: unknown) => void>(),
    },
  };
}

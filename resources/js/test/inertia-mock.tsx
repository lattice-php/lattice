import type { ReactNode } from "react";
import { vi } from "vitest";

/**
 * The `@inertiajs/react` surface tests replace with `vi.mock`. Call this inside
 * the mock factory — `vi.mock("@inertiajs/react", () => inertiaMock({ ... }))` —
 * and pass overrides for the exports a test asserts on (a hoisted `router`, a
 * component-specific `Link`, …). The mock factory runs lazily, so referencing
 * this import from inside it is safe under vi.mock hoisting.
 */
export function inertiaMock(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    Link: ({ children, ...rest }: { children?: ReactNode }) => <a {...rest}>{children}</a>,
    Head: ({ title }: { title?: string }) => <title>{title}</title>,
    Form: ({ children }: { children: ReactNode }) => <form>{children}</form>,
    usePage: vi.fn<() => { url: string }>(() => ({ url: "/" })),
    useHttp: () => ({
      delete: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
      get: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
      patch: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
      post: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
      put: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
      processing: false,
      transform:
        vi.fn<(callback: (data: Record<string, unknown>) => Record<string, unknown>) => void>(),
    }),
    router: {
      on: vi.fn<(event: string, listener: (event: Event) => void) => () => void>(
        () => () => undefined,
      ),
      reload: vi.fn<() => void>(),
      visit: vi.fn<(url: string, options?: unknown) => void>(),
    },
    ...overrides,
  };
}

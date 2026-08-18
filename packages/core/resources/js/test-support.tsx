import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { onTestFinished, vi } from "vitest";
import type { Registry } from "./registry";
import { RegistryProvider } from "./registry-context";
import type { ComponentPropsOf, Node, RendererComponent, Schema } from "./types";

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
    wrapper: ({ children }) => <RegistryProvider registry={registry}>{children}</RegistryProvider>,
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
 * Stubs global `fetch` to serve `responses` in order, repeating the last one
 * for extra calls. A Response body reads only once, so each call hands out a
 * clone of the pristine original. The root vitest config unstubs globals
 * between tests, so no manual restore is needed.
 */
export function stubFetch(...responses: Response[]) {
  let calls = 0;
  const fetch = vi.fn<typeof globalThis.fetch>(async () => {
    const response = responses[Math.min(calls, responses.length - 1)];
    calls += 1;

    return response ? response.clone() : jsonResponse({});
  });

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

/**
 * Replaces `navigator.clipboard` with a stub whose `writeText` mock is
 * returned for assertions. The original property descriptor is restored
 * automatically when the test finishes.
 */
export function stubClipboard(writeText = vi.fn<Clipboard["writeText"]>(async () => undefined)) {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });

  onTestFinished(() => {
    if (descriptor) {
      Object.defineProperty(navigator, "clipboard", descriptor);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  return writeText;
}

type FakeXhrProgress = { lengthComputable: boolean; loaded: number; total: number };

/**
 * Stand-in for `XMLHttpRequest` (install with `vi.stubGlobal("XMLHttpRequest",
 * FakeXhr)` and clear with `FakeXhr.reset()` per test). `send()` records the
 * body and stays in flight; the suite drives the transfer via `progress()`,
 * `succeed()`, and `fail()` on the recorded instance.
 */
export class FakeXhr {
  static instances: FakeXhr[] = [];

  static reset(): void {
    FakeXhr.instances = [];
  }

  body: unknown = null;

  headers: Record<string, string> = {};

  method = "";

  onerror: (() => void) | null = null;

  onload: (() => void) | null = null;

  responseText = "";

  status = 0;

  upload: { onprogress: ((event: FakeXhrProgress) => void) | null } = { onprogress: null };

  url = "";

  constructor() {
    FakeXhr.instances.push(this);
  }

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  send(body: unknown = null): void {
    this.body = body;
  }

  setRequestHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  progress(loaded: number, total = 10): void {
    this.upload.onprogress?.({ lengthComputable: true, loaded, total });
  }

  succeed(status = 200, responseText = ""): void {
    this.status = status;
    this.responseText = responseText;
    this.onload?.();
  }

  fail(): void {
    this.onerror?.();
  }
}

/** Minimal `"text"` component for probe registries: renders `props.text` as a span. */
export const TextProbe: RendererComponent<"text"> = ({ node }) => (
  <span>{String(node.props?.text)}</span>
);

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

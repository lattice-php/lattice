import { describe, expect, it, vi } from "vitest";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import FragmentComponent from "./fragment";

const registry = createRegistry({
  components: { fragment: eagerComponent(FragmentComponent) },
  name: "test/fragment",
});

describe("Lattice fragment component in a browser", () => {
  it("reserves the declared min height with a matching skeleton while loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(() => new Promise<Response>(() => {})),
    );

    await renderWithRegistry(
      <Renderer
        nodes={[
          {
            id: "settings.two-factor-setup",
            props: {
              endpoint: "/lattice/fragments/settings.two-factor-setup",
              lazy: true,
              size: "lg",
            },
            type: "fragment",
          },
        ]}
      />,
      registry,
    );

    const fragment = document.querySelector('[data-lattice-fragment="settings.two-factor-setup"]');
    const skeleton = fragment?.querySelector('[data-slot="skeleton"]');

    expect(fragment).toBeInstanceOf(HTMLElement);
    expect(skeleton).toBeInstanceOf(HTMLElement);
    expect((fragment as HTMLElement).getBoundingClientRect().height).toBe(320);
    expect((skeleton as HTMLElement).getBoundingClientRect().height).toBe(320);
  });
});

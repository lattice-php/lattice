import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";
import type { ComponentRenderOptions } from "vitest-browser-react";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { RegistryContext } from "@lattice-php/core/registry-context";
import FragmentComponent from "./fragment";

const registry = createRegistry({
  components: { fragment: eagerComponent(FragmentComponent) },
  name: "test/fragment",
});

const withRegistry: ComponentRenderOptions = {
  wrapper: ({ children }) => (
    <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>
  ),
};

describe("Lattice fragment component in a browser", () => {
  it("reserves the declared min height with a matching skeleton while loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(() => new Promise<Response>(() => {})),
    );

    await render(
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
      withRegistry,
    );

    const fragment = document.querySelector('[data-lattice-fragment="settings.two-factor-setup"]');
    const skeleton = fragment?.querySelector('[data-slot="skeleton"]');

    expect(fragment).toBeInstanceOf(HTMLElement);
    expect(skeleton).toBeInstanceOf(HTMLElement);
    expect((fragment as HTMLElement).getBoundingClientRect().height).toBe(320);
    expect((skeleton as HTMLElement).getBoundingClientRect().height).toBe(320);
  });
});

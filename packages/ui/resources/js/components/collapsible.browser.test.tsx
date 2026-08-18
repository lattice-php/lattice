import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode } from "@lattice-php/core/test-support";
import CollapsibleComponent from "./collapsible";
import TextComponent from "./text";

const registry = createRegistry({
  components: {
    collapsible: eagerComponent(CollapsibleComponent),
    text: eagerComponent(TextComponent),
  },
  name: "test/collapsible",
});

describe("Collapsible in a browser", () => {
  it("opens its nested tooltip without toggling the disclosure", async () => {
    const screen = await renderWithRegistry(
      <Renderer
        nodes={[
          fakeNode({
            id: "name",
            type: "collapsible",
            props: {
              tooltip: "Reveals the edit form.",
              trigger: [fakeNode({ type: "text", props: { text: "Name" } })],
            },
            schema: [fakeNode({ type: "text", props: { text: "Hidden body" } })],
          }),
        ]}
      />,
      registry,
    );

    const disclosure = screen.container.querySelector("details");
    expect(disclosure?.open).toBe(false);

    await userEvent.click(screen.getByRole("button", { name: "More information" }));

    await expect.element(screen.getByText("Reveals the edit form.")).toBeVisible();
    expect(disclosure?.open).toBe(false);
  });
});

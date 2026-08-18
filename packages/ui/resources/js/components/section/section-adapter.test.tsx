import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import TextAdapter from "../text/text-adapter";
import SectionAdapter from "./section-adapter";

const registry = createRegistry({
  components: {
    section: eagerComponent(SectionAdapter),
    text: eagerComponent(TextAdapter),
  },
  name: "test/section-adapter",
});

describe("SectionAdapter", () => {
  it("persists collapsed state by node identity", () => {
    window.localStorage.clear();

    renderWithRegistry(
      <Renderer
        nodes={[
          {
            id: "advanced",
            type: "section",
            props: { title: "Advanced", collapsible: true, rememberState: true },
            schema: [{ type: "text", props: { text: "Hidden body" } }],
          },
        ]}
      />,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse section" }));

    expect(window.localStorage.getItem("lattice:section:advanced")).toBe("true");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { createElement, useState } from "react";
import { expect, it, vi } from "vitest";
import { eagerComponent } from "../../packages/core/resources/js/registry";
import { useExtensionRegistry } from "../../packages/core/resources/js/registry-context";
import type { Node } from "../../packages/core/resources/js";
import PreviewRuntime from "./PreviewRuntime";

vi.mock("../../packages/map/resources/js/plugin", () => {
  function ExtensionProbe() {
    const extensions = useExtensionRegistry<{ preview?: { label: string } }>("docs.preview");
    const [label, setLabel] = useState("Resolve extension");

    return createElement(
      "button",
      { onClick: () => setLabel(extensions.preview?.label ?? "Extension missing") },
      label,
    );
  }

  return {
    default: {
      name: "docs/preview-extension-probe",
      components: { map: eagerComponent(ExtensionProbe) },
      extensions: { "docs.preview": { preview: { label: "Extension ready" } } },
    },
  };
});

it("makes package extensions available to preview components", () => {
  render(<PreviewRuntime nodes={[{ props: {}, type: "map" } as Node]} />);

  fireEvent.click(screen.getByRole("button", { name: "Resolve extension" }));

  expect(screen.getByRole("button").textContent).toBe("Extension ready");
});

import { fakeNode } from "@lattice-php/core/test-support";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import type { RendererComponent } from "@lattice-php/core";
import { renderWithForm } from "@lattice-php/form/test-support";
import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { TextInputComponent } from "../fields/text-input";

const StubLink: RendererComponent = ({ node }) => (
  <a href={String(node.props?.href ?? "")}>{String(node.props?.label ?? "")}</a>
);

it("renders a field's labelAction node at the end of the label row", () => {
  const registry = createRegistry({
    name: "test",
    components: { link: eagerComponent(StubLink) },
  });

  const node = fakeNode({
    type: "field.text-input",
    props: {
      name: "email",
      label: "Email",
      labelAction: { type: "link", props: { label: "Need help?", href: "/help" } },
    },
  });

  renderWithForm(<TextInputComponent node={node}>{null}</TextInputComponent>, { registry });

  const action = screen.getByRole("link", { name: "Need help?" });
  expect(action).toHaveAttribute("href", "/help");
  expect(screen.getByLabelText("Email")).toBeInTheDocument();
});

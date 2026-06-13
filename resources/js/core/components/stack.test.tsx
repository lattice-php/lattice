import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice/lattice/test-support";
import StackComponent from "./stack";

describe("Lattice stack component", () => {
  it("applies server-defined alignment, gap, and width props", () => {
    const node = fakeNode({
      id: "login-page",
      props: {
        align: "center",
        gap: "lg",
        width: "sm",
      },
      type: "stack",
    });

    render(<StackComponent node={node}>Content</StackComponent>);

    expect(screen.getByText("Content")).toHaveClass(
      "justify-items-center",
      "gap-6",
      "max-w-md",
      "text-center",
    );
  });

  it("can lay children out horizontally", () => {
    const node = fakeNode({
      id: "login-prompt",
      props: {
        align: "center",
        direction: "row",
        gap: "xs",
      },
      type: "stack",
    });

    render(<StackComponent node={node}>Content</StackComponent>);

    expect(screen.getByText("Content")).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "gap-1",
    );
  });

  it("renders a column as flex with justification when justify is set", () => {
    const node = fakeNode({
      id: "sidebar-body",
      props: { justify: "between", width: "fill" },
      type: "stack",
    });

    render(<StackComponent node={node}>Content</StackComponent>);

    const el = screen.getByText("Content");
    expect(el).toHaveClass("flex", "flex-col", "justify-between", "flex-1");
    expect(el).not.toHaveClass("grid");
  });

  it("still renders a column as a grid when justify is absent", () => {
    const node = fakeNode({ id: "plain", props: { gap: "md" }, type: "stack" });

    render(<StackComponent node={node}>Content</StackComponent>);

    expect(screen.getByText("Content")).toHaveClass("grid");
  });
});

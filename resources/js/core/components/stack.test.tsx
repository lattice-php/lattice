import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@bambamboole/lattice/core/types";
import StackComponent from "./stack";

describe("Lattice stack component", () => {
  it("applies server-defined alignment, gap, and width props", () => {
    const node = {
      id: "login-page",
      props: {
        align: "center",
        gap: "lg",
        width: "sm",
      },
      type: "stack",
    } satisfies Node<"stack">;

    render(<StackComponent node={node}>Content</StackComponent>);

    expect(screen.getByText("Content")).toHaveClass(
      "justify-items-center",
      "gap-6",
      "max-w-md",
      "text-center",
    );
  });

  it("can lay children out horizontally", () => {
    const node = {
      id: "login-prompt",
      props: {
        align: "center",
        direction: "row",
        gap: "xs",
      },
      type: "stack",
    } satisfies Node<"stack">;

    render(<StackComponent node={node}>Content</StackComponent>);

    expect(screen.getByText("Content")).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "gap-1",
    );
  });
});

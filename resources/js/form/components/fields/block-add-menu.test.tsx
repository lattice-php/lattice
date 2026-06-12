import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BlockAddMenu } from "./block-add-menu";

it("lists blocks and emits the chosen type", () => {
  const onSelect = vi.fn<(type: string) => void>();
  render(
    <BlockAddMenu
      addLabel="Add block"
      blocks={[
        { type: "text", label: "Text" },
        { type: "product", label: "Product line" },
      ]}
      onSelect={onSelect}
    />,
  );

  fireEvent.click(screen.getByText("Add block"));
  fireEvent.click(screen.getByText("Product line"));

  expect(onSelect).toHaveBeenCalledWith("product");
});

import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AddRowMenu } from "./add-row-menu";

it("lists row options and emits the chosen type", () => {
  const onSelect = vi.fn<(type: string) => void>();
  render(
    <AddRowMenu
      addLabel="Add block"
      options={[
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

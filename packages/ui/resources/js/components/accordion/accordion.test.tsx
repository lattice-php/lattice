import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Accordion, useAccordionItem } from "./accordion";

function Item({ id }: { id: string }) {
  const item = useAccordionItem(id);

  if (item === null) {
    return <div>{id} unmanaged</div>;
  }

  return (
    <button aria-expanded={item.open} onClick={() => item.setOpen(!item.open)} type="button">
      {id}
    </button>
  );
}

describe("Accordion", () => {
  it("keeps at most one item open and closes the open item on toggle", () => {
    render(
      <Accordion items={["a", "b"]}>
        <Item id="a" />
        <Item id="b" />
      </Accordion>,
    );

    const first = screen.getByRole("button", { name: "a" });
    const second = screen.getByRole("button", { name: "b" });

    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(second);
    expect(second).toHaveAttribute("aria-expanded", "false");
  });

  it("starts with the default item open and follows a changed default", () => {
    const view = render(
      <Accordion defaultOpen="b" items={["a", "b"]}>
        <Item id="a" />
        <Item id="b" />
      </Accordion>,
    );

    expect(screen.getByRole("button", { name: "b" })).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "a" }));
    expect(screen.getByRole("button", { name: "a" })).toHaveAttribute("aria-expanded", "true");

    view.rerender(
      <Accordion defaultOpen="a" items={["a", "b"]}>
        <Item id="a" />
        <Item id="b" />
      </Accordion>,
    );

    expect(screen.getByRole("button", { name: "a" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "b" })).toHaveAttribute("aria-expanded", "false");
  });

  it("scopes coordination to its own items so a nested accordion toggles independently", () => {
    render(
      <Accordion items={["a", "b"]}>
        <Item id="a" />
        <Accordion items={["x"]}>
          <Item id="x" />
          <Item id="b" />
        </Accordion>
        <Item id="b" />
      </Accordion>,
    );

    const outer = screen.getByRole("button", { name: "b" });
    fireEvent.click(outer);
    expect(outer).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "x" }));
    expect(screen.getByRole("button", { name: "x" })).toHaveAttribute("aria-expanded", "true");
    expect(outer).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("b unmanaged")).toBeInTheDocument();
  });
});

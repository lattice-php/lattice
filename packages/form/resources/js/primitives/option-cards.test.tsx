import { configure, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { Node, Option } from "@lattice-php/core/types";
import { OptionCards } from "./option-cards";

configure({ testIdAttribute: "data-test" });

const registry = createRegistry({
  components: {
    text: eagerComponent(({ node }: { node: Node }) => (
      <span>{String((node.props as { text?: unknown }).text ?? "")}</span>
    )),
  },
  name: "test/option-cards",
});

const optionSchema: Node[] = [
  { key: "name", type: "text", props: { text: "", dataBindings: { text: "label" } } },
  { key: "hint", type: "text", props: { text: "", dataBindings: { text: "description" } } },
];

const options: Option[] = [
  { label: "Passkey", value: "passkey", data: { description: "Face ID or Touch ID" } },
  { label: "Authenticator", value: "totp", data: { description: "Six digit code" } },
];

function renderCards(props: Partial<Parameters<typeof OptionCards>[0]> = {}) {
  return renderWithRegistry(
    <OptionCards
      name="provider"
      onSelect={vi.fn<(value: string) => void>()}
      optionSchema={optionSchema}
      options={options}
      value="passkey"
      {...props}
    />,
    registry,
  );
}

describe("OptionCards", () => {
  it("renders each option through the bound schema", () => {
    renderCards();

    expect(screen.getByTestId("provider-passkey")).toHaveTextContent("Passkey");
    expect(screen.getByTestId("provider-passkey")).toHaveTextContent("Face ID or Touch ID");
    expect(screen.getByTestId("provider-totp")).toHaveTextContent("Six digit code");
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("marks the selected card and calls onSelect on click", () => {
    const onSelect = vi.fn<(value: string) => void>();
    renderCards({ onSelect });

    expect(screen.getByTestId("provider-passkey")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("provider-totp")).toHaveAttribute("aria-checked", "false");

    fireEvent.click(screen.getByTestId("provider-totp"));
    expect(onSelect).toHaveBeenCalledWith("totp");
  });

  it("moves the selection to the next card with the arrow keys", () => {
    const onSelect = vi.fn<(value: string) => void>();
    renderCards({ onSelect, value: "passkey" });

    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });

    expect(onSelect).toHaveBeenCalledWith("totp");
  });

  it("wraps past either end of the group", () => {
    const onSelect = vi.fn<(value: string) => void>();
    const { unmount } = renderCards({ onSelect, value: "passkey" });

    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowUp" });
    expect(onSelect).toHaveBeenCalledWith("totp");

    unmount();
    onSelect.mockClear();
    renderCards({ onSelect, value: "totp" });

    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });
    expect(onSelect).toHaveBeenCalledWith("passkey");
  });

  it("keeps a single tab stop on the selected card", () => {
    renderCards({ value: "totp" });

    expect(screen.getByTestId("provider-totp")).toHaveAttribute("tabindex", "0");
    expect(screen.getByTestId("provider-passkey")).toHaveAttribute("tabindex", "-1");
  });

  it("gives the first card the tab stop while nothing is selected", () => {
    renderCards({ value: "" });

    expect(screen.getByTestId("provider-passkey")).toHaveAttribute("tabindex", "0");
  });

  it("focuses the selected card when autoFocus is on", () => {
    renderCards({ autoFocus: true, value: "totp" });

    expect(screen.getByTestId("provider-totp")).toHaveFocus();
  });

  it("ignores the arrow keys and disables every card when disabled", () => {
    const onSelect = vi.fn<(value: string) => void>();
    renderCards({ disabled: true, onSelect });

    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowDown" });

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByTestId("provider-passkey")).toBeDisabled();
    expect(screen.getByTestId("provider-totp")).toBeDisabled();
  });
});

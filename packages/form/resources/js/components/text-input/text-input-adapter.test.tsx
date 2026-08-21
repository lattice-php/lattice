import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { createFieldRenderer } from "../../test-support";
import { TextInputAdapter } from "./text-input-adapter";

const renderField = createFieldRenderer(TextInputAdapter);

afterEach(() => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  vi.restoreAllMocks();
});

describe("TextInputAdapter copy affix", () => {
  it("copies the current input value", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    renderField(
      fakeNode({
        type: "field.text-input",
        props: { name: "api_key", label: "API key", copyable: true },
      }),
    );

    fireEvent.change(screen.getByRole("textbox", { name: "API key" }), {
      target: { value: "tok_secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Copy API key" }));

    expect(writeText).toHaveBeenCalledWith("tok_secret");
    expect(await screen.findByRole("button", { name: "Copied API key" })).toBeInTheDocument();
  });
});

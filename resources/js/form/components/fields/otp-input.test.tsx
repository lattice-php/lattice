import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider } from "../values";
import { OtpInputComponent } from "./otp-input";

function renderField(node: Node<"field.otp">, initial: Record<string, unknown> = {}) {
  return render(
    <FormValuesProvider initial={initial}>
      <OtpInputComponent node={node}>{null}</OtpInputComponent>
    </FormValuesProvider>,
  );
}

describe("OtpInputComponent", () => {
  it("renders a one-time-code input with the configured length", () => {
    renderField(fakeNode({ type: "field.otp", props: { name: "code", label: "Code", length: 4 } }));

    expect(screen.getByRole("textbox")).toHaveAttribute("maxlength", "4");
  });

  it("commits the entered code and renders it in the slots", () => {
    renderField(fakeNode({ type: "field.otp", props: { name: "code", label: "Code", length: 4 } }));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "12" } });

    expect(input).toHaveValue("12");
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("hides when its visible condition fails", () => {
    renderField(
      fakeNode({
        type: "field.otp",
        props: {
          name: "code",
          label: "Code",
          length: 6,
          conditions: { visible: [{ field: "mode", operator: "eq", value: "2fa" }] },
        },
      }),
      { mode: "off" },
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

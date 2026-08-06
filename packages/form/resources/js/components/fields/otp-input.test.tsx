import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { createFieldRenderer } from "@lattice-php/form/test-support";
import { OtpInputComponent } from "./otp-input";

const renderField = createFieldRenderer(OtpInputComponent);

// input-otp schedules uncancelled 0/10/50ms layout timers that call setState;
// one firing after this file's jsdom is torn down crashes the whole run with
// "window is not defined". Let them fire while the environment still exists.
afterEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
});

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
});

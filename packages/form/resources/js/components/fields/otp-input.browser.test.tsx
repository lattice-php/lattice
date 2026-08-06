import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { FormValuesProvider } from "@lattice-php/form/hooks/values";
import { OtpInputComponent } from "./otp-input";

function renderOtp() {
  return render(
    <FormValuesProvider initial={{}}>
      <OtpInputComponent
        node={fakeNode({ type: "field.otp", props: { name: "code", label: "Code", length: 4 } })}
      >
        {null}
      </OtpInputComponent>
    </FormValuesProvider>,
  );
}

describe("OtpInputComponent in a browser", () => {
  it("renders a one-time-code input with the configured length", async () => {
    const screen = await renderOtp();

    await expect.element(screen.getByRole("textbox")).toHaveAttribute("maxlength", "4");
  });

  it("commits the typed code and renders it in the slots", async () => {
    const screen = await renderOtp();
    const input = screen.getByRole("textbox");

    await input.click();
    await userEvent.keyboard("12");

    await expect.element(input).toHaveValue("12");
    await expect.element(screen.getByText("1")).toBeInTheDocument();
    await expect.element(screen.getByText("2")).toBeInTheDocument();
  });
});

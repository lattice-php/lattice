import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { FormValuesProvider } from "../../hooks/values";
import { OtpInputAdapter } from "./otp-input-adapter";

function renderOtp() {
  return render(
    <FormValuesProvider initial={{}}>
      <OtpInputAdapter
        node={fakeNode({ type: "field.otp", props: { name: "code", label: "Code", length: 4 } })}
      >
        {null}
      </OtpInputAdapter>
    </FormValuesProvider>,
  );
}

describe("OtpInputAdapter in a browser", () => {
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

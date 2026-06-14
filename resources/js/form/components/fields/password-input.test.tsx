import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider } from "../values";
import { PasswordInputComponent } from "./password-input";

function renderField(node: Node<"form.password-input">, initial: Record<string, unknown> = {}) {
  return render(
    <FormValuesProvider initial={initial}>
      <PasswordInputComponent node={node}>{null}</PasswordInputComponent>
    </FormValuesProvider>,
  );
}

describe("PasswordInputComponent conditions", () => {
  it("hides when its visible condition fails", () => {
    renderField(
      fakeNode({
        type: "form.password-input",
        props: {
          name: "password",
          label: "Password",
          conditions: { visible: [{ field: "mode", operator: "eq", value: "reset" }] },
        },
      }),
      { mode: "login" },
    );

    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("shows when its visible condition matches", () => {
    renderField(
      fakeNode({
        type: "form.password-input",
        props: {
          name: "password",
          label: "Password",
          conditions: { visible: [{ field: "mode", operator: "eq", value: "reset" }] },
        },
      }),
      { mode: "reset" },
    );

    expect(screen.getByLabelText("Password")).toBeVisible();
  });

  it("renders a prefilled password value", () => {
    renderField(
      fakeNode({
        type: "form.password-input",
        props: {
          name: "password",
          label: "Password",
        },
      }),
      { password: "password" },
    );

    expect(screen.getByLabelText("Password")).toHaveValue("password");
  });
});

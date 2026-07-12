import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createFieldRenderer, fakeConditions, fakeNode } from "@lattice-php/lattice/test-support";
import { FormValuesProvider, useFormValue } from "@lattice-php/lattice/form/hooks/values";
import { PasswordInputComponent } from "./password-input";

const renderField = createFieldRenderer(PasswordInputComponent);

function CommittedValue({ name }: { name: string }) {
  return <output data-test={`value-${name}`}>{String(useFormValue(name) ?? "")}</output>;
}

describe("PasswordInputComponent conditions", () => {
  it("hides when its visible condition fails", () => {
    renderField(
      fakeNode({
        type: "field.password-input",
        props: {
          name: "password",
          label: "Password",
          conditions: fakeConditions({
            visible: [{ field: "mode", operator: "eq", value: "reset" }],
          }),
        },
      }),
      { mode: "login" },
    );

    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("shows when its visible condition matches", () => {
    renderField(
      fakeNode({
        type: "field.password-input",
        props: {
          name: "password",
          label: "Password",
          conditions: fakeConditions({
            visible: [{ field: "mode", operator: "eq", value: "reset" }],
          }),
        },
      }),
      { mode: "reset" },
    );

    expect(screen.getByLabelText("Password")).toBeVisible();
  });

  it("renders a prefilled password value", () => {
    renderField(
      fakeNode({
        type: "field.password-input",
        props: {
          name: "password",
          label: "Password",
        },
      }),
      { password: "password" },
    );

    expect(screen.getByLabelText("Password")).toHaveValue("password");
  });

  it("commits the confirmation field value", () => {
    render(
      <FormValuesProvider initial={{}}>
        <PasswordInputComponent
          node={fakeNode({
            type: "field.password-input",
            props: {
              name: "password",
              label: "Password",
              confirmation: {
                name: "password_confirmation",
                label: "Confirm password",
                placeholder: "Confirm password",
              },
            },
          })}
        >
          {null}
        </PasswordInputComponent>
        <CommittedValue name="password_confirmation" />
      </FormValuesProvider>,
    );

    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "secret" },
    });

    expect(screen.getByTestId("value-password_confirmation")).toHaveTextContent("secret");
  });
});

describe("PasswordInputComponent affixes", () => {
  it("renders a text prefix around the password control", () => {
    renderField(
      fakeNode({
        type: "field.password-input",
        props: { name: "token", label: "Token", prefix: { icon: null, text: "tok_" } },
      }),
    );

    expect(screen.getByText("tok_")).toBeVisible();
  });
});

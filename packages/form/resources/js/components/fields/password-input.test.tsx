import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { FormValuesProvider, useFormValue } from "@lattice-php/form/hooks/values";
import { PasswordInputComponent } from "./password-input";

function CommittedValue({ name }: { name: string }) {
  return <output data-test={`value-${name}`}>{String(useFormValue(name) ?? "")}</output>;
}

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

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { FormValuesProvider, useFormValue } from "../../hooks/values";
import { PasswordInputAdapter } from "./password-input-adapter";

function CommittedValue({ name }: { name: string }) {
  return <output data-test={`value-${name}`}>{String(useFormValue(name) ?? "")}</output>;
}

it("commits the confirmation field value", () => {
  render(
    <FormValuesProvider initial={{}}>
      <PasswordInputAdapter
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
      </PasswordInputAdapter>
      <CommittedValue name="password_confirmation" />
    </FormValuesProvider>,
  );

  fireEvent.change(screen.getByLabelText("Confirm password"), {
    target: { value: "secret" },
  });

  expect(screen.getByTestId("value-password_confirmation")).toHaveTextContent("secret");
});

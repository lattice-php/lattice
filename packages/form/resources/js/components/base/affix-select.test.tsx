import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { renderWithForm } from "@lattice-php/form/test-support";
import { NumberInputAdapter } from "../number-input/number-input-adapter";
import { TextInputAdapter } from "../text-input/text-input-adapter";

function currencySelectNode() {
  return fakeNode({
    type: "field.select",
    props: {
      name: "currency",
      label: "Currency",
      options: [
        { label: "EUR", value: "eur", data: null },
        { label: "USD", value: "usd", data: null },
      ],
    },
  });
}

describe("affix selects", () => {
  it("commits a suffix select choice into the form state", () => {
    const node = fakeNode({
      type: "field.number-input",
      props: { name: "amount", label: "Amount", suffixFieldName: "currency" },
      schema: [currencySelectNode()],
    });

    renderWithForm(<NumberInputAdapter node={node}>{null}</NumberInputAdapter>, {
      initial: {},
    });

    fireEvent.click(screen.getByTestId("select-currency"));
    fireEvent.click(screen.getByTestId("select-currency-option-eur"));

    expect(screen.getByTestId("select-currency")).toHaveTextContent("EUR");
    expect(document.querySelector('input[type="hidden"][name="currency"]')).toHaveValue("eur");
  });

  it("renders a prefix select beside the host input and keeps both submittable", () => {
    const node = fakeNode({
      type: "field.text-input",
      props: { name: "phone", label: "Phone", prefixFieldName: "dialing_code" },
      schema: [
        fakeNode({
          type: "field.select",
          props: {
            name: "dialing_code",
            label: "Dialing code",
            value: "49",
            options: [
              { label: "+49", value: "49", data: null },
              { label: "+43", value: "43", data: null },
            ],
          },
        }),
      ],
    });

    renderWithForm(<TextInputAdapter node={node}>{null}</TextInputAdapter>, { initial: {} });

    fireEvent.change(screen.getByRole("textbox", { name: "Phone" }), {
      target: { value: "1512345" },
    });
    fireEvent.click(screen.getByTestId("select-dialing_code"));
    fireEvent.click(screen.getByTestId("select-dialing_code-option-43"));

    expect(screen.getByRole("textbox", { name: "Phone" })).toHaveValue("1512345");
    expect(document.querySelector('input[type="hidden"][name="dialing_code"]')).toHaveValue("43");
  });
});

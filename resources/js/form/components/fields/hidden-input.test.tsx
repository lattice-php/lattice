import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FieldScopeProvider } from "@lattice-php/lattice/form/hooks/field-scope";
import { HiddenInputComponent } from "./hidden-input";

describe("HiddenInputComponent", () => {
  it("uses scoped names inside row fields", () => {
    const node = fakeNode({
      type: "field.hidden-input",
      props: { name: "token", value: "abc" },
    });

    const { container } = render(
      <FieldScopeProvider
        base="items.0.children"
        index={1}
        row={{ rowId: "r1", token: "abc" }}
        onChange={() => {}}
      >
        <HiddenInputComponent node={node}>{null}</HiddenInputComponent>
      </FieldScopeProvider>,
    );

    const input = container.querySelector<HTMLInputElement>(
      'input[name="items[0][children][1][token]"]',
    );

    expect(input?.value).toBe("abc");
  });
});

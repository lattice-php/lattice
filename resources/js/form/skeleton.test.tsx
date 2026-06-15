import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FormSkeletonComponent } from "./skeleton";

describe("FormSkeletonComponent", () => {
  it("renders a label and input placeholder per visible field plus a submit row", () => {
    const node = fakeNode({
      type: "form",
      schema: [
        {
          type: "grid",
          schema: [
            { type: "form.text-input", props: {} },
            { type: "form.text-input", props: {} },
            { type: "form.hidden-input", props: {} },
          ],
        },
      ],
    });

    const { container } = render(<FormSkeletonComponent node={node}>{null}</FormSkeletonComponent>);

    // 2 visible fields × (label + input) + 1 submit placeholder.
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(5);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RawBlockAdapter } from "./raw-block-adapter";

describe("RawBlock", () => {
  it("renders trusted server html without adding layout", () => {
    render(
      <RawBlockAdapter
        node={{ props: { html: '<span data-test="avatar">AL</span>' }, type: "raw-block" }}
      >
        {null}
      </RawBlockAdapter>,
    );

    expect(screen.getByTestId("avatar")).toHaveTextContent("AL");
  });
});

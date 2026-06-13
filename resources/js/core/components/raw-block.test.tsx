import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RawBlockComponent from "./raw-block";

describe("RawBlock", () => {
  it("renders trusted server html without adding layout", () => {
    render(
      <RawBlockComponent
        node={{ props: { html: '<span data-testid="avatar">AL</span>' }, type: "raw-block" }}
      >
        {null}
      </RawBlockComponent>,
    );

    expect(screen.getByTestId("avatar")).toHaveTextContent("AL");
  });
});

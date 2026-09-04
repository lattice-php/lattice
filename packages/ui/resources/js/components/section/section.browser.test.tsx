import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { Section } from "./section";

describe("Section in a browser", () => {
  it("keeps a collapsed section's fields in the submitted form data", async () => {
    const screen = await render(
      <form>
        <Section collapsible title="Advanced">
          <input data-test="field-x" defaultValue="secret" name="x" />
        </Section>
      </form>,
    );

    await expect.element(screen.getByTestId("field-x")).toBeVisible();

    await screen.getByRole("button", { name: "Collapse section" }).click();

    await expect.element(screen.getByTestId("field-x")).not.toBeVisible();

    const form = screen.container.querySelector("form");
    const data = new FormData(form!);

    expect(data.get("x")).toBe("secret");
  });
});

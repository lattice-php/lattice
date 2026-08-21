import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { Stack } from "./stack";

describe("Stack in a browser", () => {
  it("pins a sticky stack below the inherited offset and publishes its height to siblings", async () => {
    const screen = await render(
      <div style={{ "--lt-sticky-offset": "56px" } as React.CSSProperties}>
        <div data-test="parent">
          <Stack sticky>
            <div data-test="header" style={{ height: 40 }}>
              Header
            </div>
          </Stack>
          <div data-test="sibling">Sibling</div>
        </div>
      </div>,
    );

    const stack = screen.getByText("Header").element().parentElement;
    const parent = screen.getByTestId("parent").element() as HTMLElement;
    const sibling = screen.getByTestId("sibling").element();

    await expect
      .poll(() => parent.style.getPropertyValue("--lt-sticky-offset"))
      .toBe("calc(56px + 72px)");
    expect(stack).not.toBeNull();
    expect(getComputedStyle(stack as HTMLElement).position).toBe("sticky");
    expect(getComputedStyle(stack as HTMLElement).top).toBe("56px");
    expect(getComputedStyle(sibling).getPropertyValue("--lt-sticky-offset")).toBe(
      "calc(56px + 72px)",
    );
  });
});

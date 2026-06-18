import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { setConfig } from "./config";
import { DateTime } from "./date-time";
import { setTimezone } from "./timezone";

afterEach(() => {
  setConfig(undefined);
  setTimezone("");
});

describe("<DateTime>", () => {
  it("renders a time element with a precise title in the active timezone", () => {
    setTimezone("Europe/Berlin");

    const { container } = render(<DateTime value="2026-06-18T00:30:00Z" />);
    const time = container.querySelector("time");

    expect(time).not.toBeNull();
    expect(time?.getAttribute("dateTime")).toBe("2026-06-18T00:30:00.000Z");
    expect(time?.getAttribute("title")).toContain("Europe/Berlin");
  });
});

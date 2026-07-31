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

  it("renders nothing for a null value", () => {
    const { container } = render(<DateTime value={null} />);

    expect(container.querySelector("time")).toBeNull();
    expect(container.textContent).toBe("");
  });

  it("renders an unparseable value verbatim without date or title attributes", () => {
    const { container } = render(<DateTime value="not-a-date" />);
    const time = container.querySelector("time");

    expect(time?.textContent).toBe("not-a-date");
    expect(time?.getAttribute("dateTime")).toBeNull();
    expect(time?.getAttribute("title")).toBeNull();
  });

  it("renders a numeric timestamp the same as its equivalent ISO string", () => {
    setTimezone("Europe/Berlin");
    const timestamp = new Date("2026-06-18T00:30:00Z").getTime();

    const { container: fromTimestamp } = render(<DateTime value={timestamp} />);
    const { container: fromIso } = render(<DateTime value="2026-06-18T00:30:00Z" />);

    const timeFromTimestamp = fromTimestamp.querySelector("time");
    const timeFromIso = fromIso.querySelector("time");

    expect(timeFromTimestamp?.textContent).toBe(timeFromIso?.textContent);
    expect(timeFromTimestamp?.getAttribute("dateTime")).toBe("2026-06-18T00:30:00.000Z");
    expect(timeFromTimestamp?.getAttribute("dateTime")).toBe(timeFromIso?.getAttribute("dateTime"));
  });
});

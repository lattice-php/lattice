import { describe, expect, it } from "vitest";
import { formatCell, preciseDateTime } from "./format";

const dateColumn = {
  key: "created",
  label: "Created",
  props: { date: { dateStyle: "medium", timeStyle: "short" } },
} as never;

describe("formatCell date rendering", () => {
  it("renders the default date format in the requested timezone", () => {
    const berlin = formatCell("2026-06-18T00:30:00Z", dateColumn, {
      locale: "en-GB",
      timeZone: "Europe/Berlin",
    });

    expect(berlin).toContain("02:30");
  });

  it("renders the same instant differently in another timezone", () => {
    const newYork = formatCell("2026-06-18T00:30:00Z", dateColumn, {
      locale: "en-GB",
      timeZone: "America/New_York",
    });

    expect(newYork).toContain("20:30");
  });
});

describe("preciseDateTime", () => {
  it("includes the IANA zone id and a year", () => {
    const text = preciseDateTime("2026-06-18T00:30:00Z", {
      locale: "en-GB",
      timeZone: "Europe/Berlin",
    });

    expect(text).toContain("2026");
    expect(text).toContain("Europe/Berlin");
  });

  it("returns an empty string for an invalid value", () => {
    expect(preciseDateTime("not-a-date", { timeZone: "UTC" })).toBe("");
  });
});

import { describe, expect, it } from "vitest";
import { formatDateValue, preciseDateTime } from "./date-time";

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

describe("formatDateValue", () => {
  it("returns the raw value when the date cannot be parsed", () => {
    expect(formatDateValue("not-a-date", { dateStyle: "medium", timeStyle: null })).toBe(
      "not-a-date",
    );
  });

  it("applies only the styles that are configured", () => {
    const dateOnly = formatDateValue(
      "2026-06-18T00:30:00Z",
      { dateStyle: "short", timeStyle: null },
      {
        locale: "en-GB",
        timeZone: "UTC",
      },
    );
    const timeOnly = formatDateValue(
      "2026-06-18T00:30:00Z",
      { dateStyle: null, timeStyle: "short" },
      {
        locale: "en-GB",
        timeZone: "UTC",
      },
    );

    expect(dateOnly).toContain("2026");
    expect(timeOnly).toContain("00:30");
  });
});

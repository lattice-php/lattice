import { describe, expect, it } from "vitest";
import { activeTimezoneForTest, setConfig } from "./config";

describe("i18n config store", () => {
  it("stores the timezone from the shared config", () => {
    setConfig({
      enabled: false,
      saveMissing: false,
      locales: ["en"],
      preloadLocales: [],
      timezone: "Europe/Berlin",
    });

    expect(activeTimezoneForTest()).toBe("Europe/Berlin");
  });

  it("falls back to null when no timezone is shared", () => {
    setConfig({
      enabled: false,
      saveMissing: false,
      locales: ["en"],
      preloadLocales: [],
      timezone: null,
    });

    expect(activeTimezoneForTest()).toBeNull();
  });
});

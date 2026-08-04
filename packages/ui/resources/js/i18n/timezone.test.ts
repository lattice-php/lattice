import { afterEach, describe, expect, it } from "vitest";
import { setConfig } from "./config";
import { currentTimezone, setTimezone } from "./timezone";

afterEach(() => {
  setConfig(undefined);
  setTimezone("");
});

describe("timezone store", () => {
  it("prefers the server-provided timezone", () => {
    setConfig({
      enabled: false,
      saveMissing: false,
      locales: ["en"],
      preloadLocales: [],
      timezone: "Europe/Berlin",
    });

    expect(currentTimezone()).toBe("Europe/Berlin");
  });

  it("falls back to the browser timezone when the server has none", () => {
    setConfig({
      enabled: false,
      saveMissing: false,
      locales: ["en"],
      preloadLocales: [],
      timezone: null,
    });

    const browserZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

    expect(currentTimezone()).toBe(browserZone);
  });

  it("uses an explicit override once set", () => {
    setTimezone("America/New_York");

    expect(currentTimezone()).toBe("America/New_York");
  });
});

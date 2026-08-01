import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { configureI18n } from "./backend";
import { useLocaleOptions } from "./locale-switcher";
import { setLocale } from "./locale";

function LocaleOptionsProbe() {
  const { locale, options, setLocale } = useLocaleOptions({
    label: (code) => `Language ${code}`,
  });

  return (
    <button onClick={() => setLocale("de")}>
      {locale}:
      {options.map((option) => `${option.value}:${option.label}:${option.active}`).join("|")}
    </button>
  );
}

describe("locale switcher helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "locale=;path=/;max-age=0";
    document.documentElement.lang = "";
    setLocale("en");
  });

  it("builds active locale options from the configured locales", async () => {
    await configureI18n({
      enabled: false,
      saveMissing: false,
      locales: ["en", "de"],
      preloadLocales: [],
      timezone: null,
    });

    render(<LocaleOptionsProbe />);

    expect(
      screen.getByRole("button", {
        name: "en:en:Language en:true|de:Language de:false",
      }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button"));

    expect(
      screen.getByRole("button", {
        name: "de:en:Language en:false|de:Language de:true",
      }),
    ).toBeVisible();
  });
});

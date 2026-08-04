import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocaleOptions } from "./locale-switcher";
import { configureI18nFromPageProps, i18nConfigFromPageProps } from "./page-props";
import { setLocale } from "./locale";

function LocalesProbe() {
  const { options } = useLocaleOptions();

  return <span>{options.map((option) => option.value).join(",")}</span>;
}

describe("page prop i18n helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "locale=;path=/;max-age=0";
    document.documentElement.lang = "";
    setLocale("en");
  });

  it("reads the shared i18n config from Inertia page props", () => {
    expect(
      i18nConfigFromPageProps({
        lattice: {
          i18n: {
            enabled: false,
            saveMissing: false,
            locales: ["en", "de"],
            preloadLocales: ["en"],
          },
        },
      }),
    ).toEqual({
      enabled: false,
      saveMissing: false,
      locales: ["en", "de"],
      preloadLocales: ["en"],
    });

    expect(i18nConfigFromPageProps({})).toBeUndefined();

    expect(
      i18nConfigFromPageProps({
        lattice: {
          i18n: { enabled: false, saveMissing: false, locales: ["en"] },
        },
      }),
    ).toBeUndefined();
  });

  it("configures the locale store from Inertia page props", async () => {
    await configureI18nFromPageProps({
      lattice: {
        i18n: { enabled: false, saveMissing: false, locales: ["en", "de"], preloadLocales: [] },
      },
    });

    render(<LocalesProbe />);

    expect(screen.getByText("en,de")).toBeVisible();
  });
});

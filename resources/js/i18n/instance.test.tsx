import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { configureI18n } from "./backend";
import { i18n, translate, useT } from "./instance";
import { setLocale } from "./locale";

const namespace = "test";

function Greeting() {
  const { t } = useT(namespace);

  return <span>{t("greeting", "Hello")}</span>;
}

function LocaleProbe() {
  const { locale, locales, setLocale } = useT(namespace);

  return <button onClick={() => setLocale("de")}>{`${locale}:${locales.join(",")}`}</button>;
}

describe("i18n instance", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "locale=;path=/;max-age=0";
    document.documentElement.lang = "";
    act(() => setLocale("en"));

    if (i18n.isInitialized && i18n.hasResourceBundle("en", namespace)) {
      i18n.removeResourceBundle("en", namespace);
    }
  });

  it("returns inline defaults without the React i18next adapter", () => {
    render(<Greeting />);

    expect(screen.getByText("Hello")).toBeVisible();
    expect(translate(namespace, "greeting", "Hello")).toBe("Hello");
  });

  it("rerenders hook consumers when resources change", async () => {
    render(<Greeting />);

    expect(screen.getByText("Hello")).toBeVisible();

    await waitFor(() => expect(i18n.isInitialized).toBe(true));

    act(() => {
      i18n.addResourceBundle("en", namespace, { greeting: "Hallo" }, true, true);
    });

    expect(await screen.findByText("Hallo")).toBeVisible();
  });

  it("returns locale controls and configured locales from useT", async () => {
    await configureI18n({ enabled: false, saveMissing: false, locales: ["en", "de"] });

    render(<LocaleProbe />);

    expect(screen.getByRole("button", { name: "en:en,de" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "en:en,de" }));

    expect(screen.getByRole("button", { name: "de:en,de" })).toBeVisible();
  });
});

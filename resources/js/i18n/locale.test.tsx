import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  localStorage.clear();
  document.cookie = "locale=;path=/;max-age=0";
  document.documentElement.lang = "";
  vi.resetModules();
});

it("persists the locale, updates the document language and dispatches the locale change event", async () => {
  const { currentLocale, localeHeader, setLocale } = await import("./locale");
  const locales: string[] = [];
  const listener = (event: Event) => {
    locales.push((event as CustomEvent<{ locale: string }>).detail.locale);
  };

  window.addEventListener("lattice:locale-change", listener);

  act(() => setLocale("de"));

  window.removeEventListener("lattice:locale-change", listener);

  expect(currentLocale()).toBe("de");
  expect(localStorage.getItem("locale")).toBe("de");
  expect(document.cookie).toContain("locale=de");
  expect(document.documentElement.lang).toBe("de");
  expect(localeHeader()).toEqual({ "Accept-Language": "de" });
  expect(locales).toEqual(["de"]);
});

it("uses the stored locale for hook subscribers", async () => {
  localStorage.setItem("locale", "de");
  const { setLocale, useLocale } = await import("./locale");

  function Probe() {
    const { locale } = useLocale();

    return <span>{locale}</span>;
  }

  render(<Probe />);

  expect(screen.getByText("de")).toBeInTheDocument();

  act(() => setLocale("en"));

  expect(screen.getByText("en")).toBeInTheDocument();
});

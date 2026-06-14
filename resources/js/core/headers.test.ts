import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  localStorage.clear();
  document.cookie = "locale=;path=/;max-age=0";
  document.documentElement.lang = "";
  vi.resetModules();
});

it("composes the locale header with the component reference header", async () => {
  const { setLocale } = await import("../i18n/locale");
  const { withHeaders } = await import("./headers");

  setLocale("de");

  expect(withHeaders("sealed-ref", { Accept: "application/json" })).toEqual({
    "Accept-Language": "de",
    "X-Lattice-Ref": "sealed-ref",
    Accept: "application/json",
  });
});

it("omits the component reference header when no reference is available", async () => {
  const { withHeaders } = await import("./headers");

  expect(withHeaders()).toEqual({ "Accept-Language": "en" });
});

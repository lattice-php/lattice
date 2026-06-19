import type { InitOptions } from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { I18nConfig } from "@lattice-php/lattice/types/generated";

vi.mock("i18next-http-backend", () => ({ default: { type: "backend" } }));
vi.mock("./config", () => ({ setConfig: vi.fn<(config: unknown) => void>() }));
vi.mock("./locale", () => ({
  localeHeader: vi.fn<() => Record<string, string>>(() => ({ "X-Locale": "de" })),
}));
vi.mock("./instance", () => ({
  i18n: { use: vi.fn<(plugin: unknown) => void>() },
  ensureI18n: vi.fn<(extend?: unknown) => Promise<unknown>>(() => Promise.resolve()),
  preloadLanguages: vi.fn<(locales: readonly string[]) => Promise<void>>(() => Promise.resolve()),
}));

import { setConfig } from "./config";
import { ensureI18n, i18n, preloadLanguages } from "./instance";
import { localeHeader } from "./locale";
import { configureI18n, enableBackend } from "./backend";

const base: InitOptions = { ns: ["translation"] };

function lastEnsureExtend(): (base: InitOptions) => InitOptions {
  const calls = vi.mocked(ensureI18n).mock.calls;
  return calls[calls.length - 1][0] as (base: InitOptions) => InitOptions;
}

function disabledConfig(overrides: Partial<I18nConfig> = {}): I18nConfig {
  return {
    enabled: false,
    saveMissing: false,
    locales: ["en"],
    preloadLocales: [],
    timezone: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("configureI18n", () => {
  it("stores the config and skips the backend when i18n is disabled", async () => {
    await configureI18n(disabledConfig(), { namespaces: ["forms"] });

    expect(setConfig).toHaveBeenCalledWith(disabledConfig());
    expect(i18n.use).not.toHaveBeenCalled();
    expect(preloadLanguages).not.toHaveBeenCalled();
    expect(lastEnsureExtend()(base).ns).toEqual(["forms"]);
  });

  it("keeps the base namespaces when none are provided", async () => {
    await configureI18n(undefined);

    expect(setConfig).toHaveBeenCalledWith(undefined);
    expect(lastEnsureExtend()(base).ns).toEqual(["translation"]);
  });

  it("wires the HTTP backend and preloads locales when enabled", async () => {
    const config = disabledConfig({
      enabled: true,
      saveMissing: true,
      preloadLocales: ["en", "de"],
    });

    await configureI18n(config, { namespaces: ["forms"] });

    expect(i18n.use).toHaveBeenCalledTimes(1);
    expect(preloadLanguages).toHaveBeenCalledWith(["en", "de"]);
    expect(lastEnsureExtend()(base)).toMatchObject({ ns: ["forms"], saveMissing: true });
  });
});

describe("enableBackend", () => {
  it("registers the HTTP backend with laravel-i18next defaults", async () => {
    await enableBackend();

    expect(i18n.use).toHaveBeenCalledTimes(1);

    const options = lastEnsureExtend()(base);
    expect(options).toMatchObject({
      partialBundledLanguages: true,
      saveMissing: false,
    });
    expect(options.backend).toMatchObject({
      loadPath: "/locales/{{lng}}/{{ns}}.json",
      addPath: "/locales/add/{{lng}}/{{ns}}",
      withCredentials: true,
    });
  });

  it("honours custom paths and namespaces", async () => {
    await enableBackend({
      namespaces: ["admin"],
      loadPath: "/i18n/{{lng}}.json",
      addPath: "/i18n/add",
      saveMissing: true,
    });

    const options = lastEnsureExtend()(base);
    expect(options.ns).toEqual(["admin"]);
    expect(options.saveMissing).toBe(true);
    expect(options.backend).toMatchObject({
      loadPath: "/i18n/{{lng}}.json",
      addPath: "/i18n/add",
    });
  });

  it("merges the locale header with caller-provided headers", async () => {
    await enableBackend({ customHeaders: () => ({ "X-CSRF": "token" }) });

    const options = lastEnsureExtend()(base);
    const headers = (
      options.backend as { customHeaders: () => Record<string, string> }
    ).customHeaders();

    expect(localeHeader).toHaveBeenCalled();
    expect(headers).toEqual({ "X-Locale": "de", "X-CSRF": "token" });
  });
});

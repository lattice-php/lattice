import { afterEach, describe, expect, it, vi } from "vitest";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { effect } from "@lattice-php/ui/test/effect-fixture";
import { builtinEffectHandlers } from "./registry";

const router = vi.hoisted(() => ({
  reload: vi.fn<() => void>(),
  visit: vi.fn<(url: string) => void>(),
}));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock({ router }),
);

const setLocale = vi.hoisted(() => vi.fn<(locale: string) => void>());
vi.mock("../i18n/locale", () => ({ setLocale }));

afterEach(() => {
  router.reload.mockReset();
  router.visit.mockReset();
  setLocale.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("builtinEffectHandlers", () => {
  it("reloadPage calls router.reload() by default", () => {
    builtinEffectHandlers["reload-page"](effect("reload-page", { full: false }));
    expect(router.reload).toHaveBeenCalledOnce();
  });

  it("reloadPage calls window.location.reload() when full is set", () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });

    builtinEffectHandlers["reload-page"](effect("reload-page", { full: true }));

    expect(reload).toHaveBeenCalledOnce();
    expect(router.reload).not.toHaveBeenCalled();
  });

  it("redirect visits the url", () => {
    builtinEffectHandlers.redirect(effect("redirect", { url: "/next" }));
    expect(router.visit).toHaveBeenCalledWith("/next");
  });

  it("download creates an anchor, sets href, clicks it, and removes it", () => {
    const hrefs: string[] = [];
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        hrefs.push(this.href);
      });

    builtinEffectHandlers.download(effect("download", { url: "/exports/report.csv" }));

    expect(click).toHaveBeenCalledOnce();
    expect(hrefs[0]).toContain("/exports/report.csv");
    expect(document.querySelector("a")).toBeNull();
  });

  it("localeChange calls setLocale with the locale", () => {
    builtinEffectHandlers["locale-change"](effect("locale-change", { locale: "de" }));
    expect(setLocale).toHaveBeenCalledWith("de");
  });

  const toastProps = {
    action: null,
    dismissible: true,
    duration: null,
    message: "hi",
    persistent: false,
    variant: "success" as const,
  };
  const calloutProps = {
    action: null,
    dismissible: true,
    message: "Hi",
    title: null,
    unique: null,
    variant: "info" as const,
  };

  it.each([
    {
      detail: toastProps,
      event: LATTICE_EVENT.toast,
      fire: () => builtinEffectHandlers.toast(effect("toast", toastProps)),
      type: "toast",
    },
    {
      detail: calloutProps,
      event: LATTICE_EVENT.callout,
      fire: () => builtinEffectHandlers.callout(effect("callout", calloutProps)),
      type: "callout",
    },
    {
      detail: { unique: "billing.state" },
      event: LATTICE_EVENT.retractCallout,
      fire: () =>
        builtinEffectHandlers["retract-callout"](
          effect("retract-callout", { unique: "billing.state" }),
        ),
      type: "retract-callout",
    },
    {
      detail: { component: "orders" },
      event: LATTICE_EVENT.reloadComponent,
      fire: () =>
        builtinEffectHandlers["reload-component"](
          effect("reload-component", { component: "orders" }),
        ),
      type: "reload-component",
    },
    {
      detail: { modal: "confirm" },
      event: LATTICE_EVENT.openModal,
      fire: () => builtinEffectHandlers["open-modal"](effect("open-modal", { modal: "confirm" })),
      type: "open-modal",
    },
    {
      detail: { modal: null },
      event: LATTICE_EVENT.closeModal,
      fire: () => builtinEffectHandlers["close-modal"](effect("close-modal", { modal: null })),
      type: "close-modal",
    },
    {
      detail: { form: "teams.create" },
      event: LATTICE_EVENT.resetForm,
      fire: () =>
        builtinEffectHandlers["reset-form"](effect("reset-form", { form: "teams.create" })),
      type: "reset-form",
    },
    {
      detail: { target: "app-sidebar" },
      event: LATTICE_EVENT.toggleSidebar,
      fire: () =>
        builtinEffectHandlers["toggle-sidebar"](
          effect("toggle-sidebar", { target: "app-sidebar" }),
        ),
      type: "toggle-sidebar",
    },
  ])(
    "$type bridges to the $event DOM event with the props as detail",
    ({ detail, event, fire }) => {
      const received: unknown[] = [];
      const listener = (domEvent: Event) => received.push((domEvent as CustomEvent).detail);
      window.addEventListener(event, listener);

      fire();

      window.removeEventListener(event, listener);
      expect(received).toEqual([detail]);
    },
  );
});

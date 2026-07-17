import { afterEach, describe, expect, it, vi } from "vitest";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { builtinEffectHandlers } from "./registry";

const router = vi.hoisted(() => ({
  reload: vi.fn<() => void>(),
  visit: vi.fn<(url: string) => void>(),
}));

vi.mock("@inertiajs/react", () => ({ router }));

const setLocale = vi.hoisted(() => vi.fn<(locale: string) => void>());
vi.mock("@lattice-php/lattice/i18n/locale", () => ({ setLocale }));

afterEach(() => {
  router.reload.mockReset();
  router.visit.mockReset();
  setLocale.mockReset();
  vi.restoreAllMocks();
});

describe("builtinEffectHandlers", () => {
  it("reloadPage calls router.reload()", () => {
    builtinEffectHandlers["reload-page"]({ type: "reload-page" } as never);
    expect(router.reload).toHaveBeenCalledOnce();
  });

  it("redirect visits the url", () => {
    builtinEffectHandlers.redirect({ type: "redirect", props: { url: "/next" } } as never);
    expect(router.visit).toHaveBeenCalledWith("/next");
  });

  it("download creates an anchor, sets href, clicks it, and removes it", () => {
    const hrefs: string[] = [];
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        hrefs.push(this.href);
      });

    builtinEffectHandlers.download({
      type: "download",
      props: { url: "/exports/report.csv" },
    } as never);

    expect(click).toHaveBeenCalledOnce();
    expect(hrefs[0]).toContain("/exports/report.csv");
    expect(document.querySelector("a")).toBeNull();
  });

  it("localeChange calls setLocale with the locale", () => {
    builtinEffectHandlers["locale-change"]({
      type: "locale-change",
      props: { locale: "de" },
    } as never);
    expect(setLocale).toHaveBeenCalledWith("de");
  });

  it("imperative handlers do NOT emit lattice:* DOM events", () => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const fired: string[] = [];
    const listener = (event: Event) => fired.push(event.type);

    window.addEventListener("lattice:reload-page", listener);
    window.addEventListener("lattice:redirect", listener);
    window.addEventListener("lattice:download", listener);
    window.addEventListener(LATTICE_EVENT.localeChange, listener);

    builtinEffectHandlers["reload-page"]({ type: "reload-page" } as never);
    builtinEffectHandlers.redirect({ type: "redirect", props: { url: "/x" } } as never);
    builtinEffectHandlers.download({ type: "download", props: { url: "/f.csv" } } as never);
    builtinEffectHandlers["locale-change"]({
      type: "locale-change",
      props: { locale: "fr" },
    } as never);

    window.removeEventListener("lattice:reload-page", listener);
    window.removeEventListener("lattice:redirect", listener);
    window.removeEventListener("lattice:download", listener);
    window.removeEventListener(LATTICE_EVENT.localeChange, listener);

    expect(fired).toEqual([]);
  });

  it("toast bridges to the lattice:toast DOM event", () => {
    const listener = vi.fn<(event: Event) => void>();
    window.addEventListener(LATTICE_EVENT.toast, listener);
    builtinEffectHandlers.toast({
      type: "toast",
      props: { variant: "success", message: "hi" },
    } as never);
    expect(listener).toHaveBeenCalledOnce();
    const detail = (listener.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toMatchObject({ message: "hi" });
    window.removeEventListener(LATTICE_EVENT.toast, listener);
  });

  it("callout bridges to the lattice:callout DOM event with the props as detail", () => {
    const received: unknown[] = [];
    const listener = (event: Event) => received.push((event as CustomEvent).detail);
    window.addEventListener(LATTICE_EVENT.callout, listener);

    builtinEffectHandlers.callout({
      type: "callout",
      props: { variant: "info", title: null, message: "Hi", dismissible: true, action: null },
    } as never);

    window.removeEventListener(LATTICE_EVENT.callout, listener);
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ message: "Hi" });
  });

  it("reloadComponent bridges to the lattice:reload-component DOM event", () => {
    const listener = vi.fn<(event: Event) => void>();
    window.addEventListener(LATTICE_EVENT.reloadComponent, listener);

    builtinEffectHandlers["reload-component"]({
      type: "reload-component",
      props: { component: "orders" },
    } as never);

    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toMatchObject({
      component: "orders",
    });
    window.removeEventListener(LATTICE_EVENT.reloadComponent, listener);
  });

  it("openModal bridges to the lattice:open-modal DOM event", () => {
    const listener = vi.fn<(event: Event) => void>();
    window.addEventListener(LATTICE_EVENT.openModal, listener);

    builtinEffectHandlers["open-modal"]({
      type: "open-modal",
      props: { modal: "confirm" },
    } as never);

    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toMatchObject({
      modal: "confirm",
    });
    window.removeEventListener(LATTICE_EVENT.openModal, listener);
  });

  it("closeModal bridges to the lattice:close-modal DOM event", () => {
    const listener = vi.fn<(event: Event) => void>();
    window.addEventListener(LATTICE_EVENT.closeModal, listener);

    builtinEffectHandlers["close-modal"]({ type: "close-modal", props: { modal: null } } as never);

    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toMatchObject({
      modal: null,
    });
    window.removeEventListener(LATTICE_EVENT.closeModal, listener);
  });

  it("resetForm bridges to the lattice:reset-form DOM event with detail equal to the props", () => {
    const received: unknown[] = [];
    const listener = (event: Event) => received.push((event as CustomEvent).detail);
    window.addEventListener(LATTICE_EVENT.resetForm, listener);

    builtinEffectHandlers["reset-form"]({
      type: "reset-form",
      props: { form: "teams.create" },
    } as never);

    window.removeEventListener(LATTICE_EVENT.resetForm, listener);
    expect(received).toEqual([{ form: "teams.create" }]);
  });

  it("toggleSidebar bridges to the lattice:toggle-sidebar DOM event with the props as detail", () => {
    const received: unknown[] = [];
    const listener = (event: Event) => received.push((event as CustomEvent).detail);
    window.addEventListener(LATTICE_EVENT.toggleSidebar, listener);

    builtinEffectHandlers["toggle-sidebar"]({
      type: "toggle-sidebar",
      props: { target: "app-sidebar" },
    } as never);

    window.removeEventListener(LATTICE_EVENT.toggleSidebar, listener);
    expect(received).toEqual([{ target: "app-sidebar" }]);
  });
});

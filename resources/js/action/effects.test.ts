import { afterEach, describe, expect, it, vi } from "vitest";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { dispatchActionEffects, isActionEffect } from "./effects";

const router = vi.hoisted(() => ({
  reload: vi.fn<() => void>(),
  visit: vi.fn<(url: string) => void>(),
}));

vi.mock("@inertiajs/react", () => ({ router }));

describe("dispatchActionEffects", () => {
  afterEach(() => {
    router.reload.mockReset();
    router.visit.mockReset();
    vi.restoreAllMocks();
  });

  it("reloads the page for a reloadPage effect", () => {
    dispatchActionEffects([{ type: "reloadPage" }]);

    expect(router.reload).toHaveBeenCalledOnce();
  });

  it("visits the target url for a redirect effect", () => {
    dispatchActionEffects([{ type: "redirect", url: "/dashboard" }]);

    expect(router.visit).toHaveBeenCalledWith("/dashboard");
  });

  it("triggers a browser download for a download effect", () => {
    const hrefs: string[] = [];
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        hrefs.push(this.href);
      });

    dispatchActionEffects([{ type: "download", url: "/exports/report.csv" }]);

    expect(click).toHaveBeenCalledOnce();
    expect(hrefs[0]).toContain("/exports/report.csv");
    expect(document.querySelector("a")).toBeNull();
  });

  it("dispatches a window event for every effect", () => {
    const events: Array<{ form?: string; type: string }> = [];
    const listener = (event: Event) => {
      events.push((event as CustomEvent).detail);
    };

    window.addEventListener("lattice:reset-form", listener);
    dispatchActionEffects([{ type: "resetForm", form: "teams.create" }]);
    window.removeEventListener("lattice:reset-form", listener);

    expect(events).toEqual([{ type: "resetForm", form: "teams.create" }]);
  });

  it("does not dispatch events for effects already handled imperatively", () => {
    const events: string[] = [];
    const listener = (event: Event) => {
      events.push(event.type);
    };

    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    window.addEventListener(LATTICE_EVENT.reloadPage, listener);
    window.addEventListener(LATTICE_EVENT.redirect, listener);
    window.addEventListener(LATTICE_EVENT.download, listener);

    dispatchActionEffects([
      { type: "reloadPage" },
      { type: "redirect", url: "/dashboard" },
      { type: "download", url: "/exports/report.csv" },
    ]);

    window.removeEventListener(LATTICE_EVENT.reloadPage, listener);
    window.removeEventListener(LATTICE_EVENT.redirect, listener);
    window.removeEventListener(LATTICE_EVENT.download, listener);

    expect(events).toEqual([]);
  });
});

describe("isActionEffect", () => {
  it("accepts every known effect type", () => {
    for (const type of [
      "toast",
      "reloadPage",
      "reloadComponent",
      "redirect",
      "download",
      "openModal",
      "closeModal",
      "resetForm",
    ]) {
      expect(isActionEffect({ type })).toBe(true);
    }
  });

  it("rejects unknown shapes", () => {
    expect(isActionEffect({ type: "explode" })).toBe(false);
    expect(isActionEffect({})).toBe(false);
    expect(isActionEffect(null)).toBe(false);
    expect(isActionEffect("toast")).toBe(false);
  });
});

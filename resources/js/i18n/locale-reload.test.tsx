import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleReload } from "./locale-reload";

const router = vi.hoisted(() => ({
  visit: vi.fn<(url: string, options: Record<string, unknown>) => void>(),
}));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock({ router }),
);

describe("LocaleReload", () => {
  beforeEach(() => {
    router.visit.mockReset();
    window.history.pushState({}, "", "/");
  });

  it("reloads the current Inertia page when the locale changes", () => {
    window.history.pushState({}, "", "/settings?tab=profile");
    const href = window.location.href;

    render(<LocaleReload />);

    window.dispatchEvent(new CustomEvent("lattice:locale-change", { detail: { locale: "de" } }));

    expect(router.visit).toHaveBeenCalledWith(href, {
      preserveScroll: true,
      preserveState: true,
    });
  });

  it("allows the reload visit options to be adjusted", () => {
    render(<LocaleReload preserveScroll={false} preserveState={false} />);

    window.dispatchEvent(new CustomEvent("lattice:locale-change", { detail: { locale: "de" } }));

    expect(router.visit).toHaveBeenCalledWith(window.location.href, {
      preserveScroll: false,
      preserveState: false,
    });
  });
});

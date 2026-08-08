import { render } from "@testing-library/react";
import { router } from "@inertiajs/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleReload } from "./locale-reload";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

describe("LocaleReload", () => {
  beforeEach(() => {
    vi.mocked(router.visit).mockReset();
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

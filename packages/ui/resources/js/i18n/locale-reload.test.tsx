import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { defaultNavigation, NavigationProvider } from "../navigation";
import { LocaleReload } from "./locale-reload";

const visit = vi.fn();

function withNavigation(children: ReactNode) {
  return (
    <NavigationProvider adapter={{ ...defaultNavigation, visit }}>{children}</NavigationProvider>
  );
}

describe("LocaleReload", () => {
  beforeEach(() => {
    visit.mockReset();
    window.history.pushState({}, "", "/");
  });

  it("revisits the current page when the locale changes", () => {
    window.history.pushState({}, "", "/settings?tab=profile");
    const href = window.location.href;

    render(withNavigation(<LocaleReload />));

    window.dispatchEvent(new CustomEvent("lattice:locale-change", { detail: { locale: "de" } }));

    expect(visit).toHaveBeenCalledWith(href, {
      preserveScroll: true,
      preserveState: true,
    });
  });

  it("allows the reload visit options to be adjusted", () => {
    render(withNavigation(<LocaleReload preserveScroll={false} preserveState={false} />));

    window.dispatchEvent(new CustomEvent("lattice:locale-change", { detail: { locale: "de" } }));

    expect(visit).toHaveBeenCalledWith(window.location.href, {
      preserveScroll: false,
      preserveState: false,
    });
  });
});

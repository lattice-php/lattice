import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.cookie = "appearance=;path=/;max-age=0";
  document.documentElement.className = "";
  document.documentElement.style.colorScheme = "";
  vi.resetModules();
});

function stubColorScheme(initialMatches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  let matches = initialMatches;
  const query = "(prefers-color-scheme: dark)";
  const mediaQueryList = {
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === "change") {
        listeners.add(listener);
      }
    },
    removeEventListener: (event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === "change") {
        listeners.delete(listener);
      }
    },
  } as MediaQueryList;

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQueryList),
  );

  return {
    setMatches(nextMatches: boolean): void {
      matches = nextMatches;
      const event = { matches, media: query } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

it("updates subscribers when the system theme changes in system mode", async () => {
  const colorScheme = stubColorScheme(false);
  localStorage.setItem("appearance", "system");
  const { initializeTheme, useAppearance } = await import(".");

  function Probe() {
    const { resolvedAppearance } = useAppearance();

    return <span>{resolvedAppearance}</span>;
  }

  initializeTheme();
  render(<Probe />);

  expect(screen.getByText("light")).toBeInTheDocument();

  act(() => {
    colorScheme.setMatches(true);
  });

  expect(screen.getByText("dark")).toBeInTheDocument();
});

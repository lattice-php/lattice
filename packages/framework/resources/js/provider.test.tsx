import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { Provider } from "./provider";
import { stubMatchMedia } from "@lattice-php/core/test-support";

beforeEach(() => {
  stubMatchMedia();
});

afterEach(() => {
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

function emitAppearance(value: unknown): void {
  act(() => {
    window.dispatchEvent(new CustomEvent("lattice:appearance-change", { detail: { value } }));
  });
}

it("applies an appearance change emitted on the appearance-change event", () => {
  render(<Provider toaster={false}>{null}</Provider>);

  emitAppearance("dark");

  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

it("ignores appearance-change events carrying an unknown value", () => {
  render(<Provider toaster={false}>{null}</Provider>);

  emitAppearance("not-a-real-appearance");

  expect(document.documentElement.classList.contains("dark")).toBe(false);
});

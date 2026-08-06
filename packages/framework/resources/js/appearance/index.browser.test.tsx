import { cdp } from "vitest/browser";
import { render } from "vitest-browser-react";
import { afterEach, expect, it } from "vitest";
import { initializeAppearance, useAppearance } from ".";

async function emulateColorScheme(value: "light" | "dark"): Promise<void> {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value }],
  });
}

afterEach(async () => {
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
  localStorage.clear();
  document.cookie = "appearance=;path=/;max-age=0";
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
});

it("updates subscribers when the system theme changes in system mode", async () => {
  await emulateColorScheme("light");
  localStorage.setItem("appearance", "system");

  function Probe() {
    return <span>{useAppearance().resolvedAppearance}</span>;
  }

  initializeAppearance();
  const screen = await render(<Probe />);

  await expect.element(screen.getByText("light")).toBeInTheDocument();

  await emulateColorScheme("dark");

  await expect.element(screen.getByText("dark")).toBeInTheDocument();
  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

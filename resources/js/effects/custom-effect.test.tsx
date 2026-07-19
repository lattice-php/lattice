import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { Provider } from "@lattice-php/lattice/provider";
import { createPlugin, extendRegistry } from "@lattice-php/lattice/core/registry";
import { registry as defaultRegistry } from "@lattice-php/lattice/registry";
import { effect } from "@lattice-php/lattice/test/effect-fixture";
import { useEffectDispatcher } from "./use-effect-dispatcher";

describe("custom effect end to end", () => {
  it("a consumer plugin handler receives its effect, built-ins still work", () => {
    const confetti = vi.fn<() => void>();
    const toastListener = vi.fn<(event: Event) => void>();
    const registry = extendRegistry(
      defaultRegistry,
      createPlugin({ name: "app/confetti", effects: { confetti } }),
    );

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider registry={registry} toaster={false}>
        {children}
      </Provider>
    );
    const { result } = renderHook(() => useEffectDispatcher(), { wrapper });

    window.addEventListener("lattice:toast", toastListener);
    result.current([
      { type: "confetti", props: { color: "gold" } },
      effect("toast", {
        action: null,
        dismissible: true,
        duration: null,
        message: "ok",
        persistent: false,
        variant: "success",
      }),
    ]);

    expect(confetti).toHaveBeenCalledOnce();
    expect(toastListener).toHaveBeenCalledOnce();
    window.removeEventListener("lattice:toast", toastListener);
  });
});

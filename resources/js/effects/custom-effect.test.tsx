import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { Provider } from "@lattice-php/lattice/provider";
import { extendRegistry } from "@lattice-php/core/registry";
import { registry as defaultRegistry } from "@lattice-php/lattice/registry";
import { effect } from "@lattice-php/lattice/test/effect-fixture";
import { useEffectDispatcher } from "./use-effect-dispatcher";

describe("custom effect end to end", () => {
  it("a consumer plugin handler receives its effect, built-ins still work", () => {
    const confetti = vi.fn<() => void>();
    const toastListener = vi.fn<(event: Event) => void>();
    const registry = extendRegistry(defaultRegistry, {
      name: "app/confetti",
      extensions: { effects: { confetti } },
    });

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

  it("uses handlers from the original registry shape", () => {
    const confetti = vi.fn<() => void>();
    const registry = { components: {}, columns: {}, effects: { confetti } };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider registry={registry} toaster={false}>
        {children}
      </Provider>
    );
    const { result } = renderHook(() => useEffectDispatcher(), { wrapper });

    result.current([{ type: "confetti", props: {} }]);

    expect(confetti).toHaveBeenCalledOnce();
  });
});

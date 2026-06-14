import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { Provider } from "@lattice-php/lattice/provider";
import { createRegistry } from "@lattice-php/lattice/core/registry";
import { useEffectDispatcher } from "./use-effect-dispatcher";

describe("useEffectDispatcher", () => {
  it("dispatches through handlers merged from the registry", () => {
    const confetti = vi.fn<() => void>();
    const registry = createRegistry({ name: "test", effects: { confetti } });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider registry={registry} toaster={false}>
        {children}
      </Provider>
    );

    const { result } = renderHook(() => useEffectDispatcher(), { wrapper });
    result.current([{ type: "confetti" }] as never);

    expect(confetti).toHaveBeenCalledOnce();
  });
});

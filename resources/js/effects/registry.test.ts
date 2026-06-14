import { describe, expect, it, vi } from "vitest";
import { builtinEffectHandlers } from "./registry";

vi.mock("@inertiajs/react", () => ({
  router: { reload: vi.fn<() => void>(), visit: vi.fn<(url: string) => void>() },
}));

describe("builtinEffectHandlers", () => {
  it("redirect visits the url", async () => {
    const { router } = await import("@inertiajs/react");
    builtinEffectHandlers.redirect({ type: "redirect", url: "/next" } as never);
    expect(router.visit).toHaveBeenCalledWith("/next");
  });

  it("toast bridges to the lattice:toast DOM event", () => {
    const listener = vi.fn<(event: Event) => void>();
    window.addEventListener("lattice:toast", listener);
    builtinEffectHandlers.toast({
      type: "toast",
      toast: { variant: "success", message: "hi" },
    } as never);
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener("lattice:toast", listener);
  });
});

import { router } from "@inertiajs/react";
import { stubMatchMedia } from "@lattice-php/core/test-support";
import type { ActionEffect } from "@lattice-php/ui/effects/dispatch";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { inertiaNavigation } from "./inertia-navigation";
import { Provider } from "./provider";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

beforeEach(() => {
  stubMatchMedia();
  vi.clearAllMocks();
});

describe("inertiaNavigation", () => {
  it("visits and reloads through the Inertia router", () => {
    inertiaNavigation.visit("/next", { preserveScroll: true });
    inertiaNavigation.reload();

    expect(router.visit).toHaveBeenCalledWith("/next", { preserveScroll: true });
    expect(router.reload).toHaveBeenCalledOnce();
  });

  it("renders links through Inertia's Link", () => {
    const { Link } = inertiaNavigation;
    render(<Link href="/spa">Go</Link>);

    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute("href", "/spa");
  });
});

describe("navigationPlugin", () => {
  it("dispatches redirect effects through the router under the Provider", () => {
    function Probe({ effects }: { effects: ActionEffect[] }) {
      const dispatch = useEffectDispatcher();
      dispatch(effects);

      return null;
    }

    render(
      <Provider toaster={false}>
        <Probe effects={[{ type: "redirect", props: { url: "/after-save" } }]} />
      </Provider>,
    );

    expect(router.visit).toHaveBeenCalledWith("/after-save");
  });
});

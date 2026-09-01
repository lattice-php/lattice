import { router } from "@inertiajs/react";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { stubMatchMedia } from "@lattice-php/core/test-support";
import type { Effect } from "@lattice-php/ui";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { useEmbeddedModal, useModal } from "@lattice-php/ui/components/modal/modal-host";
import { useNavigation } from "@lattice-php/ui/navigation";
import { act, fireEvent, render, screen } from "@testing-library/react";
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

function CurrentUrlProbe() {
  const { currentUrl } = useNavigation();

  return <output>{currentUrl}</output>;
}

function fireNavigateTo(url: string): void {
  const calls = vi.mocked(router.on).mock.calls.filter(([event]) => event === "navigate");

  act(() => {
    for (const call of calls) {
      const listener = call[1] as (event: { detail: { page: { url: string } } }) => void;
      listener({ detail: { page: { url } } });
    }
  });
}

describe("useInertiaNavigation", () => {
  it("seeds the current url from the initial page and follows navigate events", () => {
    render(
      <Provider initialUrl="/products?page=2" toaster={false}>
        <CurrentUrlProbe />
      </Provider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("/products");

    fireNavigateTo("/products/1#details");

    expect(screen.getByRole("status")).toHaveTextContent("/products/1");
  });
});

function ElementDialog() {
  const context = useEmbeddedModal();

  if (context && !context.open) {
    return null;
  }

  return (
    <div role="dialog" aria-label="Modal">
      Opened
    </div>
  );
}

function ModalOpener() {
  const host = useModal();

  return (
    <button onClick={() => host.open(<ElementDialog />)} type="button">
      Open
    </button>
  );
}

function fireNavigate(): void {
  const call = vi.mocked(router.on).mock.calls.find(([event]) => event === "navigate");
  const listener = call?.[1] as ((event: Event) => void) | undefined;

  act(() => listener?.(new Event("navigate")));
}

describe("useCloseModalsOnNavigate", () => {
  it("closes an open modal on a real navigation", () => {
    render(
      <Provider toaster={false}>
        <ModalOpener />
      </Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireNavigate();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("leaves an open modal untouched when a reload-component effect fires instead of a navigation", () => {
    render(
      <Provider toaster={false}>
        <ModalOpener />
      </Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(LATTICE_EVENT.reloadComponent, { detail: { component: "some-fragment" } }),
      );
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("navigationPlugin", () => {
  it("dispatches redirect effects through the router under the Provider", () => {
    function Probe({ effects }: { effects: Effect[] }) {
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

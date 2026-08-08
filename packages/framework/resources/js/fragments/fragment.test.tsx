import { act, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import {
  jsonResponse,
  renderWithRegistry,
  stubFetch,
  TextProbe,
} from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import FragmentComponent from "./fragment";

const registry = createRegistry({
  components: {
    fragment: eagerComponent(FragmentComponent),
    text: eagerComponent(TextProbe),
  },
  name: "test/fragment",
});

function fragmentNode(props: Record<string, unknown> = {}): Node {
  return {
    id: "settings.two-factor-setup",
    props: {
      endpoint: "/lattice/fragments/settings.two-factor-setup",
      lazy: true,
      size: "md",
      ...props,
    },
    type: "fragment",
  };
}

function renderFragment(props: Record<string, unknown> = {}) {
  return renderWithRegistry(<Renderer nodes={[fragmentNode(props)]} />, registry);
}

function fragmentResponse(text: string): Response {
  return jsonResponse({ schema: [{ props: { text }, type: "text" }] });
}

describe("Lattice fragment component", () => {
  it("does not restart an in-flight fragment load when the locale changes", async () => {
    const fetch = vi.fn<() => Promise<Response>>(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetch);

    renderFragment();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    act(() => {
      window.dispatchEvent(new CustomEvent("lattice:locale-change", { detail: { locale: "de" } }));
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not fetch a lazy fragment without an endpoint", async () => {
    const fetch = stubFetch();

    const { container } = renderFragment({ endpoint: null });

    await waitFor(() => {
      expect(
        container.querySelector('[data-lattice-fragment="settings.two-factor-setup"]'),
      ).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("ignores fragment responses without a schema array", async () => {
    const fetch = stubFetch(
      jsonResponse({ schema: { props: { text: "Malformed fragment body" }, type: "text" } }),
    );

    renderFragment();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText("Malformed fragment body")).not.toBeInTheDocument();
  });

  it("loads fragment schemas and renders them with the current registry", async () => {
    const fetch = stubFetch(fragmentResponse("Loaded fragment body"));

    renderFragment({ ref: "sealed-reference" });

    await waitFor(() => {
      expect(screen.getByText("Loaded fragment body")).toBeVisible();
    });

    expect(fetch).toHaveBeenCalledWith("/lattice/fragments/settings.two-factor-setup", {
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        "X-Lattice-Ref": "sealed-reference",
      },
    });
  });

  it("reloads a loaded fragment when its component receives a reload effect", async () => {
    const fetch = stubFetch(
      fragmentResponse("Initial fragment body"),
      fragmentResponse("Reloaded fragment body"),
    );

    renderFragment();

    await waitFor(() => {
      expect(screen.getByText("Initial fragment body")).toBeVisible();
    });

    act(() => {
      window.dispatchEvent(
        new CustomEvent("lattice:reload-component", {
          detail: { component: "settings.billing-panel" },
        }),
      );
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(
        new CustomEvent("lattice:reload-component", {
          detail: { component: "settings.two-factor-setup" },
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Reloaded fragment body")).toBeVisible();
    });
  });

  it("reloads a loaded fragment when the locale changes", async () => {
    stubFetch(
      fragmentResponse("Initial fragment body"),
      fragmentResponse("Translated fragment body"),
    );

    renderFragment();

    await waitFor(() => {
      expect(screen.getByText("Initial fragment body")).toBeVisible();
    });

    act(() => {
      window.dispatchEvent(new CustomEvent("lattice:locale-change", { detail: { locale: "de" } }));
    });

    await waitFor(() => {
      expect(screen.getByText("Translated fragment body")).toBeVisible();
    });
  });
});

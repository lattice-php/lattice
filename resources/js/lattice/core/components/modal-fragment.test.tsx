import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createLatticeRegistry, eagerComponent } from "@/lattice/core/registry";
import { LatticeRenderer } from "@/lattice/core/renderer";
import type { LatticeRendererComponent } from "@/lattice/core/types";
import FragmentComponent from "./fragment";
import ModalComponent from "./modal";
import TextComponent from "./text";

const TextProbe: LatticeRendererComponent<"text"> = ({ node }) => (
  <span>{String(node.props?.text)}</span>
);

describe("Lattice modal and fragment components", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens and closes modal content from lattice events", () => {
    const registry = createLatticeRegistry({
      components: {
        modal: eagerComponent(ModalComponent),
        text: eagerComponent(TextComponent),
      },
      name: "test/modal",
    });

    render(
      <LatticeRenderer
        nodes={[
          {
            children: [
              {
                props: {
                  text: "Authenticator setup",
                },
                type: "text",
              },
            ],
            id: "settings.two-factor-setup",
            props: {
              title: "Set up two-factor authentication",
            },
            type: "modal",
          },
        ]}
        registry={registry}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new CustomEvent("lattice:open-modal", {
          detail: {
            modal: "settings.two-factor-setup",
          },
        }),
      );
    });

    expect(screen.getByRole("dialog", { name: "Set up two-factor authentication" })).toBeVisible();
    expect(screen.getByText("Authenticator setup")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("loads fragment schemas and renders them with the current registry", async () => {
    const fetch = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

    fetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          components: [
            {
              props: {
                text: "Loaded fragment body",
              },
              type: "text",
            },
          ],
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetch);

    const registry = createLatticeRegistry({
      components: {
        fragment: eagerComponent(FragmentComponent),
        text: eagerComponent(TextProbe),
      },
      name: "test/fragment",
    });

    render(
      <LatticeRenderer
        nodes={[
          {
            id: "settings.two-factor-setup",
            props: {
              endpoint: "/lattice/fragments/settings.two-factor-setup",
              lazy: true,
            },
            type: "fragment",
          },
        ]}
        registry={registry}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Loaded fragment body")).toBeVisible();
    });

    expect(fetch).toHaveBeenCalledWith("/lattice/fragments/settings.two-factor-setup", {
      headers: {
        Accept: "application/json",
      },
    });
  });

  it("reloads a loaded fragment when its component receives a reload effect", async () => {
    const fetch = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

    fetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            components: [
              {
                props: {
                  text: "Initial fragment body",
                },
                type: "text",
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            components: [
              {
                props: {
                  text: "Reloaded fragment body",
                },
                type: "text",
              },
            ],
          }),
        ),
      );

    vi.stubGlobal("fetch", fetch);

    const registry = createLatticeRegistry({
      components: {
        fragment: eagerComponent(FragmentComponent),
        text: eagerComponent(TextProbe),
      },
      name: "test/fragment",
    });

    render(
      <LatticeRenderer
        nodes={[
          {
            id: "settings.two-factor-setup",
            props: {
              endpoint: "/lattice/fragments/settings.two-factor-setup",
              lazy: true,
            },
            type: "fragment",
          },
        ]}
        registry={registry}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Initial fragment body")).toBeVisible();
    });

    act(() => {
      window.dispatchEvent(
        new CustomEvent("lattice:reload-component", {
          detail: {
            component: "settings.two-factor-setup",
          },
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Reloaded fragment body")).toBeVisible();
    });
  });
});

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { router } from "@inertiajs/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LatticeNode } from "@/lattice/core/types";
import { IconRendererProvider } from "@/lattice/icons";
import type { LatticeIconRenderer } from "@/lattice/icons";
import ActionComponent from "./action";

const http = vi.hoisted(() => ({
  delete: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  patch: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  post: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  processing: false,
  put: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  transform: vi.fn<(callback: (data: Record<string, unknown>) => Record<string, unknown>) => void>(),
}));

vi.mock("@inertiajs/react", () => ({
  router: {
    reload: vi.fn<() => void>(),
    visit: vi.fn<(url: string) => void>(),
  },
  useHttp: () => http,
}));

describe("Lattice action component", () => {
  beforeEach(() => {
    http.delete.mockReset();
    http.patch.mockReset();
    http.post.mockReset();
    http.put.mockReset();
    http.transform.mockReset();
    http.processing = false;
    vi.mocked(router.reload).mockReset();
    vi.mocked(router.visit).mockReset();
  });

  it("submits the configured action endpoint", async () => {
    http.post.mockResolvedValue({ ok: true });

    const node = {
      props: {
        endpoint: "/lattice/actions/send-test-email",
        label: "Send test email",
        method: "post",
      },
      type: "action",
    } satisfies LatticeNode<"action">;

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Send test email" }));

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith("/lattice/actions/send-test-email");
    });
  });

  it("visits get action endpoints through inertia", () => {
    const node = {
      props: {
        endpoint: "/settings/teams/acme",
        label: "Edit",
        method: "get",
        variant: "secondary",
      },
      type: "action",
    } satisfies LatticeNode<"action">;

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(router.visit).toHaveBeenCalledWith("/settings/teams/acme");
    expect(http.post).not.toHaveBeenCalled();
  });

  it("sends action refs with requests", async () => {
    http.patch.mockResolvedValue({ ok: true });

    const node = {
      props: {
        endpoint: "/lattice/actions/teams.sync",
        label: "Sync",
        ref: "sealed-reference",
        method: "patch",
      },
      type: "action",
    } satisfies LatticeNode<"action">;

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Sync" }));

    await waitFor(() => {
      expect(http.patch).toHaveBeenCalledWith("/lattice/actions/teams.sync");
    });

    const transform = http.transform.mock.calls[0]?.[0];

    expect(transform?.({})).toEqual({
      _lattice: "sealed-reference",
    });
  });

  it("appends action refs to get endpoints", () => {
    const node = {
      props: {
        endpoint: "/settings/teams",
        label: "Teams",
        ref: "sealed-reference",
        method: "get",
      },
      type: "action",
    } satisfies LatticeNode<"action">;

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Teams" }));

    expect(router.visit).toHaveBeenCalledWith("/settings/teams?_lattice=sealed-reference");
  });

  it("renders configured icons through the icon renderer", () => {
    const iconRenderer = vi.fn<LatticeIconRenderer>(({ icon }) => (
      <span data-testid="action-icon">{icon}</span>
    ));

    const node = {
      props: {
        endpoint: "/lattice/actions/send-test-email",
        icon: "custom.spark",
        label: "Send test email",
        method: "post",
      },
      type: "action",
    } satisfies LatticeNode<"action">;

    render(
      <IconRendererProvider mode="replace" renderer={iconRenderer}>
        <ActionComponent node={node}>{null}</ActionComponent>
      </IconRendererProvider>,
    );

    expect(iconRenderer).toHaveBeenCalledWith({
      className: "size-4",
      icon: "custom.spark",
    });
    expect(screen.getByTestId("action-icon")).toHaveTextContent("custom.spark");
    expect(screen.getByRole("button", { name: "custom.sparkSend test email" })).toBeVisible();
  });

  it("opens a confirmation modal before submitting destructive actions", async () => {
    http.delete.mockResolvedValue({ ok: true });

    const node = {
      props: {
        confirmation: {
          cancelLabel: "Keep account",
          confirmLabel: "Delete account",
          description: "This cannot be undone.",
          title: "Delete account?",
        },
        endpoint: "/lattice/actions/delete-account",
        label: "Delete account",
        method: "delete",
        variant: "destructive",
      },
      type: "action",
    } satisfies LatticeNode<"action">;

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));

    expect(http.delete).not.toHaveBeenCalled();
    const firstDialog = screen.getByRole("dialog", { name: "Delete account?" });

    expect(firstDialog).toBeVisible();
    expect(screen.getByText("This cannot be undone.")).toBeVisible();

    fireEvent.click(within(firstDialog).getByRole("button", { name: "Keep account" }));

    expect(screen.queryByRole("dialog", { name: "Delete account?" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Delete account?" })).getByRole("button", {
        name: "Delete account",
      }),
    );

    await waitFor(() => {
      expect(http.delete).toHaveBeenCalledWith("/lattice/actions/delete-account");
    });
  });

  it("dispatches successful response effects as lattice events", async () => {
    http.patch.mockResolvedValue({
      effects: [
        {
          message: "Profile updated.",
          type: "toast",
        },
        {
          component: "settings.profile",
          type: "reloadComponent",
        },
        {
          type: "reloadPage",
        },
      ],
      ok: true,
    });

    const toastListener = vi.fn<(event: Event) => void>();
    const reloadListener = vi.fn<(event: Event) => void>();
    const reloadPageListener = vi.fn<(event: Event) => void>();

    window.addEventListener("lattice:toast", toastListener);
    window.addEventListener("lattice:reload-component", reloadListener);
    window.addEventListener("lattice:reload-page", reloadPageListener);

    const node = {
      props: {
        endpoint: "/lattice/actions/update-profile",
        label: "Save",
        method: "patch",
        variant: "secondary",
      },
      type: "action",
    } satisfies LatticeNode<"action">;

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(toastListener).toHaveBeenCalledTimes(1);
      expect(reloadListener).toHaveBeenCalledTimes(1);
      expect(reloadPageListener).toHaveBeenCalledTimes(1);
    });

    const [[toastEvent]] = toastListener.mock.calls as [[CustomEvent]];
    const [[reloadEvent]] = reloadListener.mock.calls as [[CustomEvent]];

    expect(toastEvent.detail).toEqual({
      message: "Profile updated.",
      type: "toast",
    });
    expect(reloadEvent.detail).toEqual({
      component: "settings.profile",
      type: "reloadComponent",
    });
    expect(router.reload).toHaveBeenCalledWith();

    window.removeEventListener("lattice:toast", toastListener);
    window.removeEventListener("lattice:reload-component", reloadListener);
    window.removeEventListener("lattice:reload-page", reloadPageListener);
  });

  it("dispatches failed responses as action errors", async () => {
    const error = new Error("Request failed");

    http.delete.mockRejectedValue(error);

    const errorListener = vi.fn<(event: Event) => void>();

    window.addEventListener("lattice:action-error", errorListener);

    const node = {
      props: {
        endpoint: "/lattice/actions/delete-account",
        label: "Delete account",
        method: "delete",
      },
      type: "action",
    } satisfies LatticeNode<"action">;

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));

    await waitFor(() => {
      expect(errorListener).toHaveBeenCalledTimes(1);
    });

    const [[errorEvent]] = errorListener.mock.calls as [[CustomEvent]];

    expect(errorEvent.detail).toEqual({ error });

    window.removeEventListener("lattice:action-error", errorListener);
  });
});

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { router } from "@inertiajs/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { IconRendererProvider } from "@lattice-php/lattice/icons";
import type { IconRendererFunction } from "@lattice-php/lattice/icons";
import { ActionMenuProvider } from "@lattice-php/lattice/ui/action-menu-context";
import ActionComponent from "./action";

const http = vi.hoisted(() => ({
  delete: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  patch: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  post: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  processing: false,
  put: vi.fn<(url: string, data?: Record<string, unknown>) => Promise<unknown>>(),
  transform:
    vi.fn<(callback: (data: Record<string, unknown>) => Record<string, unknown>) => void>(),
}));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock({ useHttp: () => http }),
);

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

    const node = fakeNode({
      props: {
        endpoint: "/lattice/actions/send-test-email",
        label: "Send test email",
        method: "post",
      },
      type: "action",
    });

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Send test email" }));

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith("/lattice/actions/send-test-email", {
        headers: { "Accept-Language": "en" },
      });
    });
  });

  it("visits get action endpoints through inertia", () => {
    const node = fakeNode({
      props: {
        endpoint: "/settings/teams/acme",
        label: "Edit",
        method: "get",
        variant: "secondary",
      },
      type: "action",
    });

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(router.visit).toHaveBeenCalledWith("/settings/teams/acme", {
      headers: { "Accept-Language": "en" },
    });
    expect(http.post).not.toHaveBeenCalled();
  });

  it("sends action refs with requests", async () => {
    http.patch.mockResolvedValue({ ok: true });

    const node = fakeNode({
      props: {
        endpoint: "/lattice/actions/teams.sync",
        label: "Sync",
        ref: "sealed-reference",
        method: "patch",
      },
      type: "action",
    });

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Sync" }));

    await waitFor(() => {
      expect(http.patch).toHaveBeenCalledWith("/lattice/actions/teams.sync", {
        headers: { "Accept-Language": "en", "X-Lattice-Ref": "sealed-reference" },
      });
    });
  });

  it("appends action refs to get endpoints", () => {
    const node = fakeNode({
      props: {
        endpoint: "/settings/teams",
        label: "Teams",
        ref: "sealed-reference",
        method: "get",
      },
      type: "action",
    });

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Teams" }));

    expect(router.visit).toHaveBeenCalledWith("/settings/teams", {
      headers: { "Accept-Language": "en", "X-Lattice-Ref": "sealed-reference" },
    });
  });

  it("renders configured icons through the icon renderer", () => {
    const iconRenderer = vi.fn<IconRendererFunction>(({ icon }) => (
      <span data-test="action-icon">{icon}</span>
    ));

    const node = fakeNode({
      props: {
        endpoint: "/lattice/actions/send-test-email",
        icon: "custom.spark",
        label: "Send test email",
        method: "post",
      },
      type: "action",
    });

    render(
      <IconRendererProvider mode="replace" renderer={iconRenderer}>
        <ActionComponent node={node}>{null}</ActionComponent>
      </IconRendererProvider>,
    );

    expect(iconRenderer).toHaveBeenCalledWith({
      className: "size-lt-icon-md",
      icon: "custom.spark",
    });
    expect(screen.getByTestId("action-icon")).toHaveTextContent("custom.spark");
    expect(screen.getByRole("button", { name: "custom.sparkSend test email" })).toBeVisible();
  });

  it("uses compact context menu styling inside action menus", () => {
    const iconRenderer = vi.fn<IconRendererFunction>(({ icon, className }) => (
      <span className={className} data-test="action-icon">
        {icon}
      </span>
    ));

    const node = fakeNode({
      props: {
        endpoint: "/products/1/edit",
        icon: "custom.spark",
        label: "Edit",
        method: "get",
        variant: "secondary",
      },
      type: "action",
    });

    render(
      <IconRendererProvider mode="replace" renderer={iconRenderer}>
        <ActionMenuProvider>
          <ActionComponent node={node}>{null}</ActionComponent>
        </ActionMenuProvider>
      </IconRendererProvider>,
    );

    expect(screen.getByRole("button", { name: "custom.sparkEdit" })).toHaveClass(
      "h-lt-control-sm",
      "w-full",
      "text-lt-popover-fg",
    );
    expect(screen.getByTestId("action-icon")).toHaveClass("size-lt-icon-sm");
  });

  it("uses a compact spinner inside action menus", () => {
    http.processing = true;

    const node = fakeNode({
      props: {
        endpoint: "/products/1/archive",
        label: "Archive",
        method: "post",
      },
      type: "action",
    });

    render(
      <ActionMenuProvider>
        <ActionComponent node={node}>{null}</ActionComponent>
      </ActionMenuProvider>,
    );

    expect(screen.getByRole("status", { name: "Loading" })).toHaveClass("size-lt-icon-sm");
  });

  it("opens a confirmation modal before submitting destructive actions", async () => {
    http.delete.mockResolvedValue({ ok: true });

    const node = fakeNode({
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
    });

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
      expect(http.delete).toHaveBeenCalledWith("/lattice/actions/delete-account", {
        headers: { "Accept-Language": "en" },
      });
    });
  });

  it("dispatches event effects and handles page reloads imperatively", async () => {
    http.patch.mockResolvedValue({
      effects: [
        {
          props: { message: "Profile updated." },
          type: "toast",
        },
        {
          props: { component: "settings.profile" },
          type: "reload-component",
        },
        {
          props: {},
          type: "reload-page",
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

    const node = fakeNode({
      props: {
        endpoint: "/lattice/actions/update-profile",
        label: "Save",
        method: "patch",
        variant: "secondary",
      },
      type: "action",
    });

    render(<ActionComponent node={node}>{null}</ActionComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(toastListener).toHaveBeenCalledTimes(1);
      expect(reloadListener).toHaveBeenCalledTimes(1);
      expect(router.reload).toHaveBeenCalledTimes(1);
    });

    expect(reloadPageListener).not.toHaveBeenCalled();

    const [[toastEvent]] = toastListener.mock.calls as [[CustomEvent]];
    const [[reloadEvent]] = reloadListener.mock.calls as [[CustomEvent]];

    expect(toastEvent.detail).toEqual({
      message: "Profile updated.",
    });
    expect(reloadEvent.detail).toEqual({
      component: "settings.profile",
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

    const node = fakeNode({
      props: {
        endpoint: "/lattice/actions/delete-account",
        label: "Delete account",
        method: "delete",
      },
      type: "action",
    });

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

import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { RegistryProvider } from "@lattice-php/core/registry-context";
import { Renderer } from "@lattice-php/core/renderer";
import { jsonResponse } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import type { NotificationItem } from "@lattice-php/lattice/notifications/types";
import { withModalHost } from "@lattice-php/ui/test/modal";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import NotificationsComponent from "./notifications";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

let receiveHandler: ((item: NotificationItem) => void) | null = null;
vi.mock("./notifications-echo", () => ({
  NotificationsEcho: ({ onReceive }: { onReceive: (item: NotificationItem) => void }) => {
    receiveHandler = onReceive;
    return null;
  },
}));

const registry = createRegistry({
  components: { notifications: eagerComponent(NotificationsComponent) },
  name: "test/notifications",
});

function renderNotifications(node: Node): ReactElement {
  return withModalHost(
    <RegistryProvider registry={registry}>
      <Renderer nodes={[node]} />
    </RegistryProvider>,
  );
}

function dispatchNavigateClose(): void {
  act(() => {
    window.dispatchEvent(new CustomEvent(LATTICE_EVENT.closeModal, { detail: { modal: null } }));
  });
}

const slideOutNode: Node = {
  type: "notifications",
  props: {
    endpoint: "/lattice/notifications",
    channel: "App.Models.User.1",
    slideOut: true,
    pollingInterval: null,
  },
};

const popoverNode: Node = {
  type: "notifications",
  props: {
    endpoint: "/lattice/notifications",
    channel: null,
    slideOut: false,
    pollingInterval: null,
  },
};

describe("NotificationsComponent", () => {
  it("shows the unread badge and opens the popover panel with items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(async () =>
        jsonResponse({
          notifications: [
            {
              id: "a",
              title: "Order shipped",
              body: null,
              icon: "bell",
              variant: "info",
              href: null,
              isRead: false,
              createdAt: null,
              actions: [],
            },
          ],
          unreadCount: 1,
          hasMore: false,
        }),
      ),
    );

    render(renderNotifications(popoverNode));

    await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    expect(await screen.findByText("Order shipped")).toBeInTheDocument();
  });

  it("opens the slide-out sheet through the modal host when the bell is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(async () =>
        jsonResponse({
          notifications: [
            {
              id: "a",
              title: "Order shipped",
              body: null,
              icon: "bell",
              variant: "info",
              href: null,
              isRead: false,
              createdAt: null,
              actions: [],
            },
          ],
          unreadCount: 1,
          hasMore: false,
        }),
      ),
    );

    render(renderNotifications(slideOutNode));

    await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("notifications-trigger"));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Order shipped")).toBeInTheDocument();
  });

  it("closes the sheet once the framework's navigate listener dispatches the close-modal event", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(async () =>
        jsonResponse({ notifications: [], unreadCount: 0, hasMore: false }),
      ),
    );

    render(renderNotifications(slideOutNode));

    fireEvent.click(screen.getByTestId("notifications-trigger"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    dispatchNavigateClose();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows a live Echo push in the sheet while it is open", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(async () =>
        jsonResponse({ notifications: [], unreadCount: 0, hasMore: false }),
      ),
    );

    render(renderNotifications(slideOutNode));

    await waitFor(() => expect(receiveHandler).not.toBeNull());

    fireEvent.click(screen.getByTestId("notifications-trigger"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    act(() => {
      receiveHandler?.({
        id: "live",
        title: "Live push",
        body: null,
        icon: null,
        variant: null,
        href: null,
        isRead: false,
        createdAt: null,
        actions: [],
      });
    });

    expect(await screen.findByText("Live push")).toBeInTheDocument();
  });
});

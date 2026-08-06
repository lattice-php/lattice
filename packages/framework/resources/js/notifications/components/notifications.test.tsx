import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { jsonResponse } from "@lattice-php/core/test-support";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import NotificationsComponent from "./notifications";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);
vi.mock("./notifications-echo", () => ({ NotificationsEcho: () => null }));

const registry = createRegistry({
  components: { notifications: eagerComponent(NotificationsComponent) },
  name: "test/notifications",
});

const node: Node = {
  type: "notifications",
  props: {
    endpoint: "/lattice/notifications",
    channel: "App.Models.User.1",
    slideOut: true,
    pollingInterval: null,
  },
};

describe("NotificationsComponent", () => {
  it("shows the unread badge and opens the panel with items", async () => {
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

    renderWithRegistry(<Renderer nodes={[node]} />, registry);

    await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    expect(await screen.findByText("Order shipped")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
  });
});

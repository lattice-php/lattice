import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { Node } from "@lattice-php/lattice/core/types";
import NotificationsComponent from "./notifications";

vi.mock("@inertiajs/react", () => ({
  usePage: () => ({ url: "/" }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("./notifications-echo", () => ({ NotificationsEcho: () => null }));

const registry = createRegistry({
  components: { notifications: eagerComponent(NotificationsComponent) },
  name: "test/notifications",
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const node: Node = {
  type: "notifications",
  props: {
    endpoint: "/lattice/notifications",
    channel: "App.Models.User.1",
    slideOut: false,
    pollingInterval: null,
  },
};

afterEach(() => vi.unstubAllGlobals());

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
              openInNewTab: false,
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
  });
});

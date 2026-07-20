import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import type { NotificationItem } from "@lattice-php/lattice/notifications/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { NotificationItemRow } from "./notification-item";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock({
    Link: ({ children, onClick, ...props }: React.ComponentProps<"a">) => (
      <a
        {...props}
        onClick={(event) => {
          event.preventDefault();
          onClick?.(event);
        }}
      >
        {children}
      </a>
    ),
  }),
);

vi.mock("@lattice-php/lattice/icons", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@lattice-php/lattice/icons")>();

  return {
    ...actual,
    IconRenderer: ({ className, icon }: { className?: string; icon: string }) => (
      <span className={className} data-icon={icon} data-test="notification-icon" />
    ),
  };
});

vi.mock("@lattice-php/lattice/core/renderer", () => ({
  RenderNode: ({ node }: { node: Node }) => (
    <span data-test="notification-action">
      {node.type}:{node.id}
    </span>
  ),
}));

function item(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: "notice-a",
    title: "Order shipped",
    body: "Tracking is available.",
    icon: "bell",
    variant: "info",
    href: null,
    isRead: false,
    createdAt: null,
    actions: [],
    ...overrides,
  };
}

describe("NotificationItemRow", () => {
  it("renders unread state, icon variant, actions, and row controls", () => {
    const onMarkRead = vi.fn<(id: string) => void>();
    const onDismiss = vi.fn<(id: string) => void>();

    render(
      <ul>
        <NotificationItemRow
          notification={item({
            actions: [fakeNode({ type: "action", id: "acknowledge" })],
            variant: "warning",
          })}
          onDismiss={onDismiss}
          onMarkRead={onMarkRead}
        />
      </ul>,
    );

    expect(screen.getByTestId("notification")).toHaveClass("bg-lt-muted/40");
    expect(screen.getByTestId("notification-icon")).toHaveAttribute("data-icon", "bell");
    expect(screen.getByTestId("notification-icon")).toHaveClass("text-lt-warning");
    expect(screen.getByTestId("notification-action")).toHaveTextContent("action:acknowledge");

    fireEvent.click(screen.getByRole("button", { name: /mark read/i }));
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));

    expect(onMarkRead).toHaveBeenCalledWith("notice-a");
    expect(onDismiss).toHaveBeenCalledWith("notice-a");
  });

  it("resolves a translatable title and body to their keys when no catalog is loaded", () => {
    render(
      <ul>
        <NotificationItemRow
          notification={item({
            title: { key: "orders.shipped.title", payload: {}, replacements: {} },
            body: { key: "orders.shipped.body", payload: {}, replacements: {} },
          })}
          onDismiss={vi.fn<(id: string) => void>()}
          onMarkRead={vi.fn<(id: string) => void>()}
        />
      </ul>,
    );

    expect(screen.getByText("orders.shipped.title")).toBeInTheDocument();
    expect(screen.getByText("orders.shipped.body")).toBeInTheDocument();
  });

  it("marks linked notifications read when the link is opened", () => {
    const onMarkRead = vi.fn<(id: string) => void>();

    render(
      <ul>
        <NotificationItemRow
          notification={item({ href: "/orders/1234" })}
          onDismiss={vi.fn<(id: string) => void>()}
          onMarkRead={onMarkRead}
        />
      </ul>,
    );

    const link = screen.getByTestId("notification-link");

    expect(link).toHaveAttribute("href", "/orders/1234");

    fireEvent.click(link);

    expect(onMarkRead).toHaveBeenCalledWith("notice-a");
  });
});

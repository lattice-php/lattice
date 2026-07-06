import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationList } from "./notification-list";
import type { NotificationItem } from "../types";

vi.mock("@inertiajs/react", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

function item(id: string, title: string): NotificationItem {
  return {
    id,
    title,
    body: "body",
    icon: "bell",
    variant: "info",
    href: null,
    openInNewTab: false,
    isRead: false,
    createdAt: null,
    actions: [],
  };
}

describe("NotificationList", () => {
  it("renders items and fires mark-read / dismiss", () => {
    const onMarkRead = vi.fn<(id: string) => void>();
    const onDismiss = vi.fn<(id: string) => void>();
    render(
      <NotificationList
        notifications={[item("a", "Order shipped")]}
        status="idle"
        hasMore={false}
        onMarkRead={onMarkRead}
        onDismiss={onDismiss}
        onLoadMore={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText("Order shipped")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /mark read/i }));
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onMarkRead).toHaveBeenCalledWith("a");
    expect(onDismiss).toHaveBeenCalledWith("a");
  });

  it("shows the empty state when there are no notifications", () => {
    render(
      <NotificationList
        notifications={[]}
        status="idle"
        hasMore={false}
        onMarkRead={vi.fn<(id: string) => void>()}
        onDismiss={vi.fn<(id: string) => void>()}
        onLoadMore={vi.fn<() => void>()}
      />,
    );
    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    const { container } = render(
      <NotificationList
        notifications={[]}
        status="loading"
        hasMore={false}
        onMarkRead={vi.fn<(id: string) => void>()}
        onDismiss={vi.fn<(id: string) => void>()}
        onLoadMore={vi.fn<() => void>()}
      />,
    );
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationList } from "./notification-list";
import type { NotificationItem } from "../types";

vi.mock("@inertiajs/react", () => ({
  Link: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

function item(id: string, title: string): NotificationItem {
  return {
    id,
    title,
    body: "body",
    icon: "bell",
    variant: "info",
    href: null,
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

  it("shows a load more button only when hasMore is true, and fires onLoadMore", () => {
    const onLoadMore = vi.fn<() => void>();
    const { rerender } = render(
      <NotificationList
        notifications={[item("a", "Order shipped")]}
        status="idle"
        hasMore={false}
        onMarkRead={vi.fn<(id: string) => void>()}
        onDismiss={vi.fn<(id: string) => void>()}
        onLoadMore={onLoadMore}
      />,
    );

    expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();

    rerender(
      <NotificationList
        notifications={[item("a", "Order shipped")]}
        status="idle"
        hasMore={true}
        onMarkRead={vi.fn<(id: string) => void>()}
        onDismiss={vi.fn<(id: string) => void>()}
        onLoadMore={onLoadMore}
      />,
    );

    const loadMoreButton = screen.getByRole("button", { name: /load more/i });
    fireEvent.click(loadMoreButton);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("renders a link and marks it read on click when href is set", () => {
    const onMarkRead = vi.fn<(id: string) => void>();
    render(
      <NotificationList
        notifications={[{ ...item("a", "Order shipped"), href: "/orders/1234" }]}
        status="idle"
        hasMore={false}
        onMarkRead={onMarkRead}
        onDismiss={vi.fn<(id: string) => void>()}
        onLoadMore={vi.fn<() => void>()}
      />,
    );

    const link = screen.getByTestId("notification-link");
    expect(link).toHaveAttribute("href", "/orders/1234");

    fireEvent.click(link);
    expect(onMarkRead).toHaveBeenCalledWith("a");
  });

  it("renders plain text (no link) when href is null", () => {
    render(
      <NotificationList
        notifications={[item("a", "Order shipped")]}
        status="idle"
        hasMore={false}
        onMarkRead={vi.fn<(id: string) => void>()}
        onDismiss={vi.fn<(id: string) => void>()}
        onLoadMore={vi.fn<() => void>()}
      />,
    );

    expect(screen.queryByTestId("notification-link")).not.toBeInTheDocument();
    expect(screen.getByText("Order shipped")).toBeInTheDocument();
  });
});

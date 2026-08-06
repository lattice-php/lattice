import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationList } from "./notification-list";
import type { NotificationItem } from "@lattice-php/lattice/notifications/types";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

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
});

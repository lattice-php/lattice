import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { notificationItem } from "@lattice-php/lattice/test-support";
import { NotificationList } from "./notification-list";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

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
        notifications={[notificationItem()]}
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
        notifications={[notificationItem()]}
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

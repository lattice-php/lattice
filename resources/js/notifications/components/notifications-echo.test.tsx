import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEchoNotification } from "@laravel/echo-react";
import type { NotificationItem } from "@lattice-php/lattice/notifications/types";
import { NotificationsEcho } from "./notifications-echo";

vi.mock("@laravel/echo-react", () => ({
  useEchoNotification: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("NotificationsEcho", () => {
  it("normalizes Echo payloads into unread notification items", () => {
    const onReceive = vi.fn<(item: NotificationItem) => void>();

    render(<NotificationsEcho channel="private-user.1" onReceive={onReceive} />);

    expect(useEchoNotification).toHaveBeenCalledWith("private-user.1", expect.any(Function));

    const receive = vi.mocked(useEchoNotification).mock.calls[0]?.[1] as (
      payload: Partial<NotificationItem>,
    ) => void;

    receive({
      id: "notice-a",
      title: "Order shipped",
      variant: "success",
      href: "/orders/1234",
    });

    expect(onReceive).toHaveBeenCalledWith({
      id: "notice-a",
      title: "Order shipped",
      body: null,
      icon: null,
      variant: "success",
      href: "/orders/1234",
      isRead: false,
      createdAt: null,
      actions: [],
    });
  });
});

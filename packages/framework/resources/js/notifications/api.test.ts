import { describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@lattice-php/lattice/test/http";
import { clearAll, dismiss, fetchNotifications, markAllRead, markRead } from "./api";

describe("notifications api", () => {
  it("fetches a page of notifications", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () =>
      jsonResponse({ notifications: [], unreadCount: 0, hasMore: false }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNotifications("/lattice/notifications", 2);

    expect(result).toEqual({ notifications: [], unreadCount: 0, hasMore: false });
    expect(fetchMock).toHaveBeenCalledWith(
      "/lattice/notifications?page=2",
      expect.objectContaining({ method: undefined }),
    );
  });

  it("posts mark-all-read and returns the unread count", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () => jsonResponse({ unreadCount: 0 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await markAllRead("/lattice/notifications");

    expect(result).toEqual({ unreadCount: 0 });
    expect(fetchMock).toHaveBeenCalledWith(
      "/lattice/notifications/read-all",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("targets the right urls for read, dismiss and clear", async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(async () => jsonResponse({ unreadCount: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    await markRead("/lattice/notifications", "abc");
    await dismiss("/lattice/notifications", "abc");
    await clearAll("/lattice/notifications");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/lattice/notifications/abc/read",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/lattice/notifications/abc",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/lattice/notifications",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});

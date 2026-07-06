import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { markReadIn, prependIncoming, removeIn, useNotifications } from "./store";
import type { NotificationItem } from "./types";

function item(id: string, isRead = false): NotificationItem {
  return {
    id,
    title: id,
    body: null,
    icon: null,
    variant: "info",
    href: null,
    openInNewTab: false,
    isRead,
    createdAt: null,
    actions: [],
  };
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("reducers", () => {
  it("prepends a new item without duplicating by id", () => {
    const list = [item("a")];
    expect(prependIncoming(list, item("b")).map((n) => n.id)).toEqual(["b", "a"]);
    expect(prependIncoming(list, item("a")).map((n) => n.id)).toEqual(["a"]);
  });

  it("marks one read and removes one immutably", () => {
    const list = [item("a"), item("b")];
    expect(markReadIn(list, "a")[0].isRead).toBe(true);
    expect(list[0].isRead).toBe(false);
    expect(removeIn(list, "a").map((n) => n.id)).toEqual(["b"]);
  });
});

describe("useNotifications", () => {
  it("hydrates on mount", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(async () =>
        jsonResponse({
          notifications: [item("a"), item("b", true)],
          unreadCount: 1,
          hasMore: false,
        }),
      ),
    );

    const { result } = renderHook(() => useNotifications({ endpoint: "/lattice/notifications" }));

    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.status).toBe("idle");
  });

  it("marks a notification read optimistically", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(async (url) => {
        if (String(url).endsWith("/read")) {
          return jsonResponse({ unreadCount: 0 });
        }
        return jsonResponse({ notifications: [item("a")], unreadCount: 1, hasMore: false });
      }),
    );

    const { result } = renderHook(() => useNotifications({ endpoint: "/lattice/notifications" }));
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));

    act(() => result.current.markRead("a"));
    expect(result.current.notifications[0].isRead).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it("prepends a received live notification and bumps the count", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(async () =>
        jsonResponse({ notifications: [item("a")], unreadCount: 0, hasMore: false }),
      ),
    );

    const { result } = renderHook(() => useNotifications({ endpoint: "/lattice/notifications" }));
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));

    act(() => result.current.receive(item("live")));
    expect(result.current.notifications[0].id).toBe("live");
    expect(result.current.unreadCount).toBe(1);
  });
});

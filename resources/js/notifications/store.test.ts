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

  it("does not mutate the original list when prepending", () => {
    const list = [item("a")];
    prependIncoming(list, item("b"));
    expect(list).toHaveLength(1);
    expect(list.map((n) => n.id)).toEqual(["a"]);
  });

  it("does not mutate the original list when removing", () => {
    const list = [item("a"), item("b")];
    removeIn(list, "a");
    expect(list).toHaveLength(2);
    expect(list.map((n) => n.id)).toEqual(["a", "b"]);
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
      vi.fn<typeof fetch>(async (url) => {
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

  it("guards against concurrent double-clicked loadMore calls", async () => {
    let page2Calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(async (url) => {
        const requested = String(url);
        if (requested.includes("page=2")) {
          page2Calls += 1;
          return jsonResponse({ notifications: [item("b")], unreadCount: 0, hasMore: false });
        }
        return jsonResponse({ notifications: [item("a")], unreadCount: 0, hasMore: true });
      }),
    );

    const { result } = renderHook(() => useNotifications({ endpoint: "/lattice/notifications" }));
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      result.current.loadMore();
      result.current.loadMore();
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(page2Calls).toBe(1);
    expect(result.current.notifications.map((n) => n.id)).toEqual(["a", "b"]);
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

  it("ignores a re-delivered live notification for an id already loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(async () =>
        jsonResponse({ notifications: [item("a")], unreadCount: 0, hasMore: false }),
      ),
    );

    const { result } = renderHook(() => useNotifications({ endpoint: "/lattice/notifications" }));
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));

    act(() => result.current.receive(item("a")));
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(0);

    act(() => result.current.receive(item("live")));
    expect(result.current.notifications.map((n) => n.id)).toEqual(["live", "a"]);
    expect(result.current.unreadCount).toBe(1);
  });
});

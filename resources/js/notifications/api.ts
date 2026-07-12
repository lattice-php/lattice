import { apiJson } from "@lattice-php/lattice/core/api";
import type { NotificationList, UnreadCount } from "./types";

export function fetchNotifications(endpoint: string, page = 1): Promise<NotificationList> {
  return apiJson<NotificationList>(`${endpoint}?page=${page}`);
}

export function markRead(endpoint: string, id: string): Promise<UnreadCount> {
  return apiJson<UnreadCount>(`${endpoint}/${id}/read`, { method: "PATCH" });
}

export function markAllRead(endpoint: string): Promise<UnreadCount> {
  return apiJson<UnreadCount>(`${endpoint}/read-all`, { method: "POST" });
}

export function dismiss(endpoint: string, id: string): Promise<UnreadCount> {
  return apiJson<UnreadCount>(`${endpoint}/${id}`, { method: "DELETE" });
}

export function clearAll(endpoint: string): Promise<UnreadCount> {
  return apiJson<UnreadCount>(endpoint, { method: "DELETE" });
}

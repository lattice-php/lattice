import { apiJson } from "@lattice-php/lattice/core/api";
import type { NotificationsResponse, UnreadCountResponse } from "./types";

export function fetchNotifications(endpoint: string, page = 1): Promise<NotificationsResponse> {
  return apiJson<NotificationsResponse>(`${endpoint}?page=${page}`);
}

export function markRead(endpoint: string, id: string): Promise<UnreadCountResponse> {
  return apiJson<UnreadCountResponse>(`${endpoint}/${id}/read`, { method: "PATCH" });
}

export function markAllRead(endpoint: string): Promise<UnreadCountResponse> {
  return apiJson<UnreadCountResponse>(`${endpoint}/read-all`, { method: "POST" });
}

export function dismiss(endpoint: string, id: string): Promise<UnreadCountResponse> {
  return apiJson<UnreadCountResponse>(`${endpoint}/${id}`, { method: "DELETE" });
}

export function clearAll(endpoint: string): Promise<UnreadCountResponse> {
  return apiJson<UnreadCountResponse>(endpoint, { method: "DELETE" });
}

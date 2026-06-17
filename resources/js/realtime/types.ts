import type { Effect } from "@lattice-php/lattice/types/generated";

export type ListenerVisibility = "public" | "private" | "presence";

export type ListenerPayload = {
  channel: string;
  visibility: ListenerVisibility;
  events: string[];
  effects: Effect[];
};

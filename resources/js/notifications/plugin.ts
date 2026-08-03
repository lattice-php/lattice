import {
  eagerComponent,
  type ComponentRegistryFor,
  type Plugin,
} from "@lattice-php/lattice/core/registry";
import type { NotificationNodeType } from "@lattice-php/lattice/types/generated";
import NotificationsComponent from "./components/notifications";

export const notificationsComponents = {
  name: "lattice/notifications",
  components: {
    notifications: eagerComponent(NotificationsComponent),
  } satisfies ComponentRegistryFor<NotificationNodeType>,
} satisfies Plugin;

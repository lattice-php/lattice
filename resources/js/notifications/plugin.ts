import {
  createPlugin,
  eagerComponent,
  type ComponentRegistryFor,
} from "@lattice-php/lattice/core/registry";
import type { NotificationNodeType } from "@lattice-php/lattice/types/generated";
import NotificationsComponent from "./components/notifications";

export const notificationsComponents = createPlugin({
  name: "lattice/notifications",
  components: {
    notifications: eagerComponent(NotificationsComponent),
  } satisfies ComponentRegistryFor<NotificationNodeType>,
});

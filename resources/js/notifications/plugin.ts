import {
  createPlugin,
  eagerComponent,
  type ComponentRegistryFor,
} from "@lattice-php/lattice/core/registry";
import NotificationsComponent from "./components/notifications";

export type NotificationsComponentType = "notifications";

export const notificationsComponents = createPlugin({
  name: "lattice/notifications",
  components: {
    notifications: eagerComponent(NotificationsComponent),
  } satisfies ComponentRegistryFor<NotificationsComponentType>,
});

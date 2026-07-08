import { createPlugin, eagerComponent } from "@lattice-php/lattice/core/registry";
import NotificationsComponent from "./components/notifications";

export const notificationsComponents = createPlugin({
  name: "lattice/notifications",
  components: {
    notifications: eagerComponent(NotificationsComponent),
  },
});

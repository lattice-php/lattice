import { createRegistry } from "@lattice-php/lattice/core/registry";
import { actionComponents } from "./action/plugin";
import { chatComponents } from "./chat/plugin";
import { uiComponents } from "./ui/plugin";
import { formComponents } from "./form/plugin";
import { layoutComponents } from "./layout/plugin";
import { notificationsComponents } from "./notifications/plugin";
import { remoteComponents } from "./remote/plugin";
import { tableComponents } from "./table/plugin";

export const registry = createRegistry(
  uiComponents,
  actionComponents,
  formComponents,
  layoutComponents,
  tableComponents,
  chatComponents,
  notificationsComponents,
  remoteComponents,
);

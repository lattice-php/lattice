import { createRegistry } from "@lattice-php/lattice/core/registry";
import { actionComponents } from "./action/plugin";
import { chatComponents } from "./chat/plugin";
import { coreComponents } from "./ui/plugin";
import { formComponents } from "./form/plugin";
import { layoutComponents } from "./layout";
import { notificationsComponents } from "./notifications/plugin";
import { remoteComponents } from "./remote/plugin";
import { tableComponents } from "./table/plugin";

export const registry = createRegistry(
  coreComponents,
  actionComponents,
  formComponents,
  layoutComponents,
  tableComponents,
  chatComponents,
  notificationsComponents,
  remoteComponents,
);

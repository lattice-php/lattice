import { createRegistry } from "@lattice-php/lattice/core/registry";
import { actionComponents } from "./action";
import { chatComponents } from "./chat";
import { coreComponents } from "./core/components";
import { formComponents } from "./form";
import { layoutComponents } from "./layout";
import { notificationsComponents } from "./notifications";
import { remoteComponents } from "./remote";
import { tableComponents } from "./table";

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

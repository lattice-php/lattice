import { createRegistry } from "@lattice-php/lattice/core/registry";
import { actionComponents } from "../action";
import { chatPlugin } from "../chat";
import { eagerCoreComponents } from "../core/components/eager";
import { eagerFormComponents } from "../form/eager";
import { layoutComponents } from "../layout/components";
import { notificationsPlugin } from "../notifications";
import { remoteComponents } from "../remote";
import { eagerTableComponents } from "../table/eager";

export const eagerRegistry = createRegistry(
  eagerCoreComponents,
  actionComponents,
  eagerFormComponents,
  layoutComponents,
  eagerTableComponents,
  chatPlugin,
  notificationsPlugin,
  remoteComponents,
);

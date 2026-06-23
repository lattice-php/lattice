import { createRegistry } from "@lattice-php/lattice/core/registry";
import { actionComponents } from "../action";
import { chatPlugin } from "../chat";
import { coreComponents } from "../core/components";
import { formComponents } from "../form";
import { layoutComponents } from "../layout/components";
import { remoteComponents } from "../remote";
import { tableComponents } from "../table";

export const lazyRegistry = createRegistry(
  coreComponents,
  actionComponents,
  formComponents,
  layoutComponents,
  tableComponents,
  chatPlugin,
  remoteComponents,
);

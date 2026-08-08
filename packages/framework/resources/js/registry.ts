import { createRegistry } from "@lattice-php/core/registry";
import type {
  ActionNodeType,
  ChatNodeType,
  FormNodeType,
  FragmentNodeType,
  LayoutNodeType,
  NodeType,
  NotificationNodeType,
  RemoteNodeType,
  TableNodeType,
  UiNodeType,
} from "@lattice-php/lattice/types/generated";
import { actionComponents } from "@lattice-php/action/plugin";
import { chatComponents } from "./chat/plugin";
import { formComponents } from "@lattice-php/form";
import { fragmentComponents } from "./fragments/plugin";
import { layoutComponents } from "./layout/plugin";
import { notificationsComponents } from "./notifications/plugin";
import { remoteComponents } from "./remote/plugin";
import { tableComponents } from "@lattice-php/table";
import { uiComponents } from "@lattice-php/ui";

// Opt-in packages whose components ship their own plugin and hand-written
// `declare module "@lattice-php/core"` augmentation (TypeScriptProfile::EMISSION_EXCLUDED)
// instead of a generated.ts of their own. WireModelBuilder::buildAll() still
// discovers them for the framework document's system-wide NodeType (every
// composer package that declares extra.lattice.discover, not just the ones
// this workbench emits a module for), so their node types are legitimately
// part of it — but they're registered by the consuming app when it opts into
// the package, not bundled here.
type OptInNodeType = "api-reference" | "media.library" | "signature" | "tree";

// Compile-time totality: every generated NodeType must belong to a registered
// plugin's union, or be an acknowledged opt-in package above. A new PHP
// domain fails here until its plugin exists (or it's added to the opt-in list).
type RegisteredNodeType =
  | ActionNodeType
  | ChatNodeType
  | FormNodeType
  | FragmentNodeType
  | LayoutNodeType
  | NotificationNodeType
  | OptInNodeType
  | RemoteNodeType
  | TableNodeType
  | UiNodeType;
type Assert<T extends true> = T;
export type AllNodeTypesRegistered = Assert<
  Exclude<NodeType, RegisteredNodeType> extends never ? true : false
>;

export const registry = createRegistry(
  uiComponents,
  fragmentComponents,
  actionComponents,
  formComponents,
  layoutComponents,
  tableComponents,
  chatComponents,
  notificationsComponents,
  remoteComponents,
);

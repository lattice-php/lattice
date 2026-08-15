import { createRegistry } from "@lattice-php/core/registry";
import { navigationPlugin } from "./inertia-navigation";
import type {
  ActionNodeType,
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
import { formComponents } from "@lattice-php/form";
import { fragmentComponents } from "./fragments/plugin";
import { layoutComponents } from "./layout/plugin";
import { notificationsComponents } from "./notifications/plugin";
import { remoteComponents } from "./remote/plugin";
import { tableComponents } from "@lattice-php/table";
import { uiComponents } from "@lattice-php/ui";

// Opt-in packages whose plugins are not bundled in the framework registry —
// a consuming app registers them itself when it opts into the package.
// WireModelBuilder::buildAll() still discovers them for the framework
// document's system-wide NodeType (every composer package that declares
// extra.lattice.discover, not just the ones this workbench emits a module
// for), so their node types are legitimately part of it and are acknowledged
// here rather than belonging to a registered plugin's union.
type OptInNodeType =
  | "api-reference"
  | "calendar"
  | "chat.box"
  | "chat.part.text"
  | "chat.part.tool-call"
  | "map"
  | "media.library"
  | "search.box"
  | "search.categories"
  | "search.input"
  | "search.preview"
  | "search.recent"
  | "search.results"
  | "signature"
  | "tree";

// Compile-time totality: every generated NodeType must belong to a registered
// plugin's union, or be an acknowledged opt-in package above. A new PHP
// domain fails here until its plugin exists (or it's added to the opt-in list).
type RegisteredNodeType =
  | ActionNodeType
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
  notificationsComponents,
  remoteComponents,
  navigationPlugin,
);

import { createRegistry } from "@lattice-php/lattice/core/registry";
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
import { actionComponents } from "./action/plugin";
import { chatComponents } from "./chat/plugin";
import { uiComponents } from "./ui/plugin";
import { formComponents } from "./form/plugin";
import { layoutComponents } from "./layout/plugin";
import { notificationsComponents } from "./notifications/plugin";
import { remoteComponents } from "./remote/plugin";
import { tableComponents } from "./table/plugin";

// Compile-time totality: every generated NodeType must belong to a registered
// plugin's union. A new PHP domain fails here until its plugin exists.
type RegisteredNodeType =
  | ActionNodeType
  | ChatNodeType
  | FormNodeType
  | FragmentNodeType
  | LayoutNodeType
  | NotificationNodeType
  | RemoteNodeType
  | TableNodeType
  | UiNodeType;
type Assert<T extends true> = T;
export type AllNodeTypesRegistered = Assert<
  Exclude<NodeType, RegisteredNodeType> extends never ? true : false
>;

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

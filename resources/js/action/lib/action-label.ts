import { translate } from "@lattice-php/lattice/i18n";
import type { Node } from "@lattice-php/lattice/core/types";

export function actionLabel(node: Node<"action" | "action.bulk">): string {
  return node.props.label ?? translate("lattice", "common.action.run", "Run action");
}

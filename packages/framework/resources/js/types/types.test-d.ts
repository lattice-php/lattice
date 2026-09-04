import type { Node } from "./index";

// The aggregate barrel merges every package's generated ComponentProps, so a
// built-in node type narrows its props here and nowhere lower.
const _okBadge: Node<"badge"> = { type: "badge", props: { label: "x", color: null } };
// @ts-expect-error label must be a string, not a number
const _badBadge: Node<"badge"> = { type: "badge", props: { label: 1 } };

void _okBadge;
void _badBadge;

import type { Node } from "@lattice-php/core";
import { cn } from "@lattice-php/ui/lib/utils";
import { useFormContext } from "../../hooks/context";
import { useFieldScope } from "../../hooks/field-scope";
import { SelectControl, useSelectDomName } from "./select-control";

/**
 * Resolve a host field's affix select child (shipped in the node's schema)
 * by the side-marker name from its wire props.
 */
export function affixFieldNode(
  node: Node,
  name: string | null | undefined,
): Node<"field.select"> | null {
  if (!name) {
    return null;
  }

  const child = node.schema?.find(
    (candidate) =>
      candidate.type === "field.select" && (candidate.props as { name?: string }).name === name,
  );

  return (child as Node<"field.select">) ?? null;
}

/**
 * A select rendered as an interactive affix segment of another field's
 * AffixGroup — e.g. a currency code beside an amount input. `last` squares the
 * outer corner when another segment (the copy button) follows it.
 */
export function AffixSelect({
  node,
  side,
  last = true,
}: {
  node: Node<"field.select">;
  side: "start" | "end";
  last?: boolean;
}) {
  const { errors } = useFormContext();
  const scope = useFieldScope();
  const name = node.props.name;
  const domName = useSelectDomName(name);
  const errorKey = scope ? scope.errorKey(name) : name;
  const error = errors[errorKey];

  return (
    <SelectControl
      node={node}
      controlProps={{
        id: domName,
        "aria-invalid": error ? true : undefined,
        "aria-label": node.props.label ?? name,
      }}
      triggerClassName={cn(
        "flex h-lt-control-md shrink-0 items-center gap-1.5 border border-lt-input bg-lt-muted px-3 text-base whitespace-nowrap outline-none group-has-[:focus-visible]:border-lt-ring",
        side === "start" && "rounded-l-lt-sm rounded-r-none border-r-0",
        side === "end" &&
          (last ? "rounded-l-none rounded-r-lt-sm border-l-0" : "rounded-none border-l-0"),
        error && "border-lt-danger",
      )}
    />
  );
}

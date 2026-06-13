import { useState } from "react";
import type { Node } from "@lattice-php/lattice/core/types";

type Props = {
  nodes: Node[];
};

function isNode(value: unknown): value is Node {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

function childNodes(node: Node): Node[] {
  const children: Node[] = [...(node.schema ?? [])];

  for (const value of Object.values(node.props ?? {})) {
    if (isNode(value)) {
      children.push(value);
    } else if (Array.isArray(value)) {
      children.push(...value.filter(isNode));
    }
  }

  return children;
}

function scalarProps(node: Node): [string, unknown][] {
  return Object.entries(node.props ?? {}).filter(([, value]) => {
    if (isNode(value)) {
      return false;
    }

    return !(Array.isArray(value) && value.some(isNode));
  });
}

function TreeNode({ node }: { node: Node }) {
  const props = scalarProps(node);
  const children = childNodes(node);
  const expandable = props.length > 0 || children.length > 0;
  const [open, setOpen] = useState(true);

  return (
    <li className="node-tree__item">
      <button
        type="button"
        className="node-tree__row"
        aria-expanded={expandable ? open : undefined}
        disabled={!expandable}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="node-tree__caret">{expandable ? (open ? "▾" : "▸") : "·"}</span>
        <span className="node-tree__type">{node.type}</span>
      </button>

      {open && expandable ? (
        <div className="node-tree__body">
          {props.length > 0 ? (
            <ul className="node-tree__props">
              {props.map(([key, value]) => (
                <li key={key} className="node-tree__prop">
                  <span className="node-tree__key">{key}</span>
                  <span className="node-tree__sep">:</span>
                  <span className="node-tree__value">{JSON.stringify(value)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {children.length > 0 ? (
            <ul className="node-tree__children">
              {children.map((child, index) => (
                <TreeNode key={child.key ?? child.id ?? index} node={child} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export default function NodeTree({ nodes }: Props) {
  return (
    <ul className="node-tree">
      {nodes.map((node, index) => (
        <TreeNode key={node.key ?? node.id ?? index} node={node} />
      ))}
    </ul>
  );
}

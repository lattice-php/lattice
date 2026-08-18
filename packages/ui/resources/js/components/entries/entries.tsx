import type { ReactNode } from "react";
import { Renderer } from "@lattice-php/core/renderer";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { toNodes } from "@lattice-php/core/nodes";
import type { Node, RendererComponent } from "@lattice-php/core/types";
import { Badge } from "../badge/badge";
import { CopyableText } from "../../primitives/copyable-text";
import { Icon } from "../../icons";
import { cn } from "../../lib/utils";
import { isTruthy } from "../../lib/is-truthy";
import { useT } from "../../i18n";
import { useFormatContext } from "../../format/format-context";
import { formatValue } from "../../format/value";
import { EntryRow } from "./entry-row";

/** The disclosure body, or undefined when the entry has no children. */
function disclosureOf(children: ReactNode, node: Node): ReactNode | undefined {
  return (node.schema ?? []).length > 0 ? children : undefined;
}

export const TextEntryComponent: RendererComponent<"entry.text"> = ({ children, node }) => {
  const { value, placeholder, copyable, label, description } = node.props;
  const text = value === null || value === undefined || value === "" ? null : String(value);

  return (
    <EntryRow
      description={description}
      disclosure={disclosureOf(children, node)}
      identity={nodeIdentity(node)}
      label={label}
    >
      {text === null ? (
        <span className="text-lt-muted-fg">{placeholder ?? "—"}</span>
      ) : copyable ? (
        <CopyableText label={text} value={text}>
          <span>{text}</span>
        </CopyableText>
      ) : (
        <span>{text}</span>
      )}
    </EntryRow>
  );
};

export const DateEntryComponent: RendererComponent<"entry.date"> = ({ children, node }) => {
  const { value, format, label, description } = node.props;
  const ctx = useFormatContext();

  return (
    <EntryRow
      description={description}
      disclosure={disclosureOf(children, node)}
      identity={nodeIdentity(node)}
      label={label}
    >
      <span>{value == null ? "—" : formatValue(value, format, ctx)}</span>
    </EntryRow>
  );
};

export const BooleanEntryComponent: RendererComponent<"entry.boolean"> = ({ children, node }) => {
  const { value, trueIcon, falseIcon, label, description } = node.props;
  const { t } = useT("lattice");
  const truthy = isTruthy(value);

  return (
    <EntryRow
      description={description}
      disclosure={disclosureOf(children, node)}
      identity={nodeIdentity(node)}
      label={label}
    >
      <span aria-label={truthy ? t("common.yes", "Yes") : t("common.no", "No")} role="img">
        <Icon
          name={truthy ? trueIcon : falseIcon}
          className={cn("size-lt-icon-md", truthy ? "text-lt-success" : "text-lt-muted-fg")}
        />
      </span>
    </EntryRow>
  );
};

export const BadgeEntryComponent: RendererComponent<"entry.badge"> = ({ children, node }) => {
  const { value, color, label, description } = node.props;
  const text = value === null || value === undefined || value === "" ? null : String(value);

  return (
    <EntryRow
      description={description}
      disclosure={disclosureOf(children, node)}
      identity={nodeIdentity(node)}
      label={label}
    >
      {text === null ? (
        <span className="text-lt-muted-fg">—</span>
      ) : (
        <Badge color={color}>{text}</Badge>
      )}
    </EntryRow>
  );
};

export const ComponentEntryComponent: RendererComponent<"entry.component"> = ({
  children,
  node,
}) => (
  <EntryRow
    description={node.props.description}
    disclosure={disclosureOf(children, node)}
    identity={nodeIdentity(node)}
    label={node.props.label}
  >
    <Renderer nodes={toNodes(node.props.value)} />
  </EntryRow>
);

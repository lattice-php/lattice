import { Renderer } from "@lattice-php/core/renderer";
import { toNodes } from "@lattice-php/core/nodes";
import { nodeIdentity, prefixedTestId } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Section } from "./section";

const SectionAdapter: RendererComponent<"section"> = ({ children, node }) => {
  const collapsible = node.props.collapsible === true;
  const headerActions = toNodes(node.props.headerActions);
  const identity = nodeIdentity(node);
  const rememberState = node.props.rememberState !== false;

  return (
    <Section
      {...(collapsible && rememberState
        ? { storageKey: `lattice:section:${identity ?? "default"}` }
        : {})}
      collapsible={collapsible}
      data-test={identity}
      defaultCollapsed={node.props.collapsed === true}
      description={node.props.description}
      headerActions={headerActions.length > 0 ? <Renderer nodes={headerActions} /> : null}
      title={node.props.title}
      toggleProps={{
        "data-test": prefixedTestId("section-toggle", identity) ?? "section-toggle-default",
      }}
      tooltip={node.props.tooltip}
    >
      {children}
    </Section>
  );
};

export default SectionAdapter;

import type { RendererComponent } from "@lattice-php/core";
import { textPropFor } from "../document/bindings";
import { BaseNode } from "../components/editor/editor-registry";
import { BindingPopover } from "./binding-popover";
import { EditableMedia } from "./editable-media";
import { EditableRichText } from "./editable-rich-text";
import { EditableTextNode } from "./editable-text-node";
import { useBlockBinding } from "./use-block-binding";

/**
 * The editor's replacement for a node type that may carry a field binding:
 * unbound nodes render exactly as the app renders them, bound nodes become
 * the inline control that matches the field.
 */
export function inlineOverride(nodeType: string): RendererComponent {
  const InlineOverride: RendererComponent = ({ node }) => {
    const binding = useBlockBinding(node);

    if (!binding) {
      return <BaseNode node={node} />;
    }

    const { kind } = binding.field;

    if (kind === "text" && textPropFor(node.type) !== null) {
      return <EditableTextNode node={node} binding={binding} />;
    }

    if (kind === "rich" && node.type === "blocks.rich-text") {
      return <EditableRichText node={node} binding={binding} />;
    }

    if (kind === "media") {
      return <EditableMedia node={node} binding={binding} />;
    }

    return (
      <BindingPopover binding={binding}>
        <BaseNode node={node} />
      </BindingPopover>
    );
  };

  InlineOverride.displayName = `InlineOverride(${nodeType})`;

  return InlineOverride;
}

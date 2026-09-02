import { useCallback, useRef } from "react";
import type { Node } from "@lattice-php/core";
import { Button } from "@lattice-php/ui/components/button/button";
import { Heading } from "@lattice-php/ui/components/heading/heading";
import { Text } from "@lattice-php/ui/components/text/text";
import { useT } from "@lattice-php/ui/i18n";
import { updateBoundText } from "../document/store";
import { useEditor } from "../components/editor/editor-context";
import type { InlineHandle } from "../components/editor/focus-registry";
import { InlineText } from "./inline-text";
import type { BlockBinding } from "./use-block-binding";
import { useTypingHandlers } from "./use-typing";

/**
 * A heading, text or button whose primary text is bound to a field: the
 * app's component keeps its look, the text inside becomes editable.
 */
export function EditableTextNode({ node, binding }: { node: Node; binding: BlockBinding }) {
  const { t } = useT("blocks");
  const { store, inline } = useEditor();
  const { block, field } = binding;
  const typing = useTypingHandlers(block.id, field.name);
  const value = typeof binding.value === "string" ? binding.value : "";
  const fieldLabel = (field.node.props as { label?: string | null }).label ?? field.name;

  const unregister = useRef<(() => void) | null>(null);
  const handle = useCallback(
    (inlineHandle: InlineHandle | null) => {
      unregister.current?.();
      unregister.current = inlineHandle
        ? inline.register(block.id, field.name, inlineHandle)
        : null;
    },
    [block.id, field.name, inline],
  );

  const control = (
    <InlineText
      value={value}
      placeholder={field.placeholder}
      multiline={field.multiline}
      testId={`inline-${block.id}-${field.name}`}
      label={t("blocks.editor.edit-field", "Edit {{label}}", { label: fieldLabel })}
      onChange={(next) =>
        store.setState((state) => updateBoundText(state, block.id, field.name, next))
      }
      onEnter={typing.splitText}
      onBackspaceEmpty={() => typing.mergeBackward(null)}
      onArrow={typing.arrow}
      handle={handle}
    />
  );

  switch (node.type) {
    case "heading": {
      const props = node.props as { level?: number; class?: string | null };

      return (
        <Heading level={props.level} className={props.class ?? undefined}>
          {control}
        </Heading>
      );
    }
    case "text": {
      const props = node.props as {
        align?: "start" | "center";
        class?: string | null;
        color?: string | null;
        size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
      };

      return (
        <Text
          align={props.align ?? undefined}
          className={props.class ?? undefined}
          color={props.color}
          size={props.size}
        >
          {control}
        </Text>
      );
    }
    default: {
      const props = node.props as {
        class?: string | null;
        emphasis?: "solid" | "outline" | "ghost" | "link";
        variant?: "primary" | "secondary" | "success" | "info" | "warning" | "danger" | null;
      };

      return (
        <Button
          className={props.class ?? undefined}
          emphasis={props.emphasis ?? "solid"}
          variant={props.variant ?? null}
          type="button"
        >
          {control}
        </Button>
      );
    }
  }
}

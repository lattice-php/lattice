import { useState } from "react";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import type { Node as WireNode } from "@lattice-php/core/types";
import type { PatternTokenData } from "@lattice-php/form/types";
import { Badge } from "@lattice-php/ui/components/badge/badge";
import { cn } from "@lattice-php/ui/lib/utils";
import { Input } from "@lattice-php/form/primitives/input";
import { NativeSelect } from "@lattice-php/ui/primitives/native-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/ui/components/popover/popover";

export type PatternTokenOptions = { tokens: PatternTokenData[] };

function PatternTokenConfigFields({
  config,
  onChange,
  schema,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  schema: WireNode[];
}) {
  return (
    <>
      {schema.map((field) => {
        const name = field.props?.name as string;
        const label = (field.props?.label as string | null) ?? name;
        const current = (config[name] ?? field.props?.value ?? "") as string;
        const set = (value: string) => onChange({ ...config, [name]: value });

        if (field.type === "field.choice" || field.type === "field.select") {
          const options = (field.props?.options ?? []) as { label: string; value: string }[];

          return (
            <label className="flex flex-col gap-1 text-sm" key={name}>
              {label}
              <NativeSelect onChange={(event) => set(event.target.value)} value={current}>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </label>
          );
        }

        if (field.type === "field.number-input" || field.type === "field.text-input") {
          return (
            <label className="flex flex-col gap-1 text-sm" key={name}>
              {label}
              <Input
                onChange={(event) => set(event.target.value)}
                type={field.type === "field.number-input" ? "number" : "text"}
                value={current}
              />
            </label>
          );
        }

        return null;
      })}
    </>
  );
}

export function PatternTokenView({
  editor,
  extension,
  node,
  selected,
  updateAttributes,
}: NodeViewProps) {
  const [open, setOpen] = useState(false);
  const tokens = (extension.options as PatternTokenOptions).tokens;
  const tokenName = node.attrs.token as string;
  const token = tokens.find((candidate) => candidate.name === tokenName);
  const config = (node.attrs.config ?? {}) as Record<string, unknown>;
  const label = token?.label ?? tokenName;
  const schema = token?.schema ?? [];

  const chip = (
    <Badge
      className={cn("cursor-default select-none", selected && "ring-2 ring-lt-ring")}
      data-test={`pattern-token-${tokenName}`}
    >
      {label}
    </Badge>
  );

  if (schema.length === 0 || !editor.isEditable) {
    return <NodeViewWrapper as="span">{chip}</NodeViewWrapper>;
  }

  return (
    <NodeViewWrapper as="span">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <button data-test={`pattern-token-${tokenName}-trigger`} type="button">
            {chip}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-56 flex-col gap-2 p-3"
          data-test={`pattern-token-${tokenName}-config`}
        >
          <PatternTokenConfigFields
            config={config}
            onChange={(next) => updateAttributes({ config: next })}
            schema={schema}
          />
        </PopoverContent>
      </Popover>
    </NodeViewWrapper>
  );
}

export const PatternTokenNode = Node.create<PatternTokenOptions>({
  name: "patternToken",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return { tokens: [] };
  },

  addAttributes() {
    return {
      token: { default: null },
      config: { default: {} },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-pattern-token]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-pattern-token": node.attrs.token }),
      node.attrs.token,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PatternTokenView);
  },
});

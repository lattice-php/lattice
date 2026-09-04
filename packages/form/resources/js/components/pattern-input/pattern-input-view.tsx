import { useEffect, useMemo, useState } from "react";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import type { RendererComponent } from "@lattice-php/core";
import type { PatternTokenData } from "../../types";
import { FormFieldFrame } from "../base/field";
import { fieldLabelAction } from "../base/label-action";
import { useFormContext } from "../../hooks/context";
import { useFieldScope } from "../../hooks/field-scope";
import { useDependentField } from "../../hooks/use-dependent-field";
import { useFieldCommit } from "../../hooks/use-field-commit";
import { useFormValue } from "../../hooks/values";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lattice-php/ui/primitives/dropdown-menu";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { PatternTokenNode } from "./node";
import { decodeSegments, docToSegments, segmentsToDoc } from "./segments";

function usedTokenNames(editor: Editor): Set<string> {
  const names = new Set<string>();

  editor.state.doc.descendants((node) => {
    if (node.type.name === "patternToken" && typeof node.attrs.token === "string") {
      names.add(node.attrs.token);
    }
  });

  return names;
}

function defaultConfigFor(token: PatternTokenData): Record<string, unknown> {
  return Object.fromEntries(
    token.schema.map((field) => [field.props?.name as string, field.props?.value ?? ""]),
  );
}

function InsertTokenMenu({
  editor,
  separator,
  tokens,
}: {
  editor: Editor;
  separator: string;
  tokens: PatternTokenData[];
}) {
  const { t } = useT("lattice");
  const [open, setOpen] = useState(false);
  const used = open ? usedTokenNames(editor) : new Set<string>();
  const available = tokens.filter((token) => !used.has(token.name));

  const insert = (token: PatternTokenData) => {
    const chain = editor.chain().focus();

    if (separator !== "") {
      chain.insertContent(separator);
    }

    chain
      .insertContent({
        type: "patternToken",
        attrs: { token: token.name, config: defaultConfigFor(token) },
      })
      .run();
  };

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1 rounded-lt-sm border border-lt-input px-2 py-1 text-sm hover:bg-lt-accent"
          data-test="pattern-input-insert-token"
          type="button"
        >
          <Icon aria-hidden="true" name="plus" />
          {t("form.pattern-input.insert-token", "Insert token")}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {available.map((token) => (
          <DropdownMenuItem
            data-test={`pattern-input-insert-token-${token.name}`}
            key={token.name}
            onClick={() => insert(token)}
          >
            {token.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const PatternInputField: RendererComponent<"field.pattern-input"> = ({ node }) => {
  const { errors } = useFormContext();
  const { hidden, required, readOnly, disabled } = useDependentField(node);
  const { change, blur } = useFieldCommit();
  const name = node.props.name;
  const scope = useFieldScope();
  const globalValue = useFormValue(name);
  const storedValue = scope ? scope.getValue(name) : globalValue;
  const domName = scope ? scope.scopedName(name) : name;
  const errorKey = scope ? scope.errorKey(name) : name;
  const locked = readOnly || disabled;
  const segments = useMemo(() => decodeSegments(storedValue), [storedValue]);

  const extensions = useMemo(
    () => [Document, Paragraph, Text, PatternTokenNode.configure({ tokens: node.props.tokens })],
    [node.props.tokens],
  );

  const multiline = node.props.multiline;
  const editor = useEditor({
    extensions,
    content: segmentsToDoc(segments, multiline),
    editable: !locked,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "px-3 py-2 outline-none",
        ...(multiline ? { style: `min-height: ${1.5 * (node.props.rows ?? 3)}rem` } : {}),
      },
      handleKeyDown: (_view, event) => (multiline ? false : event.key === "Enter"),
    },
    onUpdate: ({ editor: instance }) => {
      // Committed as a JSON string: TrimStrings would strip leading/trailing
      // whitespace (and multiline `\n` boundaries) from array leaf values.
      change(name, JSON.stringify(docToSegments(instance.getJSON())));
    },
    onBlur: () => {
      blur(name);
    },
  });

  useEffect(() => {
    editor?.setEditable(!locked);
  }, [editor, locked]);

  if (hidden) {
    return null;
  }

  const submittedValue = segments.length > 0 ? JSON.stringify(segments) : "";

  return (
    <FormFieldFrame
      error={errors[errorKey]}
      helperText={node.props.helperText ?? undefined}
      tooltip={node.props.tooltip ?? undefined}
      labelAction={fieldLabelAction(node.props.labelAction)}
      label={node.props.label ?? ""}
      id={domName}
      required={required}
    >
      {(controlProps) => (
        <>
          <div
            {...controlProps}
            className={cn(
              "overflow-hidden rounded-lt-sm border border-lt-input bg-transparent shadow-lt-xs focus-within:border-lt-ring focus-within:ring-[length:var(--lt-ring-width)] focus-within:ring-lt-ring/50",
              disabled && "opacity-60",
              readOnly && !disabled && "cursor-default bg-lt-muted",
            )}
            role="group"
          >
            {editor && !locked && (
              <div className="border-b border-lt-border p-1">
                <InsertTokenMenu
                  editor={editor}
                  separator={node.props.separator}
                  tokens={node.props.tokens}
                />
              </div>
            )}
            <EditorContent editor={editor} />
          </div>
          <input name={domName} type="hidden" value={submittedValue} />
        </>
      )}
    </FormFieldFrame>
  );
};

export default PatternInputField;

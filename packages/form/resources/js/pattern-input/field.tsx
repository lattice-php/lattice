import { useEffect, useMemo, useState } from "react";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { type Editor, EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import type { RendererComponent } from "@lattice-php/core";
import type { PatternTokenData } from "@lattice-php/form/types";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { useFormContext } from "@lattice-php/form/hooks/context";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { useDependentField } from "@lattice-php/form/hooks/use-dependent-field";
import { useFieldCommit } from "@lattice-php/form/hooks/use-field-commit";
import { useFormValue } from "@lattice-php/form/hooks/values";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lattice-php/ui/dropdown-menu";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { PatternTokenNode } from "./node";

type TextSegment = { type: "text"; value: string };
type TokenSegment = { type: "token"; token: string; config: Record<string, unknown> };
type PatternSegment = TextSegment | TokenSegment;

function segmentsToDoc(segments: PatternSegment[]): JSONContent {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: segments.flatMap((segment): JSONContent[] => {
          if (segment.type === "text") {
            return segment.value === "" ? [] : [{ type: "text", text: segment.value }];
          }

          return [
            { type: "patternToken", attrs: { token: segment.token, config: segment.config } },
          ];
        }),
      },
    ],
  };
}

function docToSegments(doc: JSONContent): PatternSegment[] {
  const content = doc.content?.[0]?.content ?? [];

  return content.flatMap((node): PatternSegment[] => {
    if (node.type === "text") {
      return node.text ? [{ type: "text", value: node.text }] : [];
    }

    if (node.type === "patternToken") {
      const attrs = node.attrs ?? {};

      return [
        {
          type: "token",
          token: attrs.token as string,
          config: (attrs.config ?? {}) as Record<string, unknown>,
        },
      ];
    }

    return [];
  });
}

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
  const storedValue = (scope ? scope.getValue(name) : globalValue) as
    | PatternSegment[]
    | null
    | undefined;
  const domName = scope ? scope.scopedName(name) : name;
  const errorKey = scope ? scope.errorKey(name) : name;
  const locked = readOnly || disabled;
  const segments = useMemo(() => storedValue ?? [], [storedValue]);

  const extensions = useMemo(
    () => [Document, Paragraph, Text, PatternTokenNode.configure({ tokens: node.props.tokens })],
    [node.props.tokens],
  );

  const editor = useEditor({
    extensions,
    content: segmentsToDoc(segments),
    editable: !locked,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "px-3 py-2 outline-none",
      },
      handleKeyDown: (_view, event) => event.key === "Enter",
    },
    onUpdate: ({ editor: instance }) => {
      change(name, docToSegments(instance.getJSON()));
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
              locked && "opacity-60",
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

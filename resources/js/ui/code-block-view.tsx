import { useEffect, useRef } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { php } from "@codemirror/lang-php";
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { EditorView, lineNumbers as showLineNumbers } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import type { CodeBlockLanguage, CodeBlockViewProps } from "./code-block";

const languages: Record<CodeBlockLanguage, Extension> = {
  text: [],
  json: json(),
  javascript: javascript(),
  shell: StreamLanguage.define(shell),
  php: php(),
};

const highlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: "var(--lt-muted-fg)", fontStyle: "italic" },
  { tag: [tags.keyword, tags.operatorKeyword, tags.controlKeyword], color: "var(--lt-primary)" },
  { tag: [tags.string, tags.special(tags.string)], color: "var(--lt-success)" },
  { tag: [tags.number, tags.bool, tags.null], color: "var(--lt-info)" },
  { tag: [tags.function(tags.variableName), tags.labelName], color: "var(--lt-accent-fg)" },
  { tag: [tags.typeName, tags.className], color: "var(--lt-danger)" },
  { tag: tags.meta, color: "var(--lt-muted-fg)" },
]);

const codeBlockTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "var(--lt-fg)",
    fontSize: "0.75rem",
  },
  ".cm-scroller": {
    fontFamily: "var(--lt-font-mono)",
    lineHeight: "1.5",
    overflow: "auto",
  },
  ".cm-content": { padding: "0.75rem" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    borderRightColor: "var(--lt-border)",
    color: "var(--lt-muted-fg)",
  },
  ".cm-line": { padding: "0" },
});

const copyableTheme = EditorView.theme({
  ".cm-content": { padding: "2.75rem 0.75rem 0.75rem" },
});

function CodeBlockView({
  children,
  copyable,
  language,
  lineNumbers,
  maxHeight,
  wrap,
}: CodeBlockViewProps) {
  const container = useRef<HTMLDivElement>(null);
  const content = useRef(children);
  const editor = useRef<EditorView>(null);
  content.current = children;

  useEffect(() => {
    if (!container.current) {
      return;
    }

    const languageCompartment = new Compartment();
    const customLanguage = typeof language === "function" ? language : null;
    const initialLanguage = typeof language === "function" ? [] : languages[language];
    const view = new EditorView({
      doc: content.current,
      parent: container.current,
      extensions: [
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
        EditorView.contentAttributes.of({ role: "code" }),
        languageCompartment.of(initialLanguage),
        syntaxHighlighting(highlightStyle),
        copyable ? copyableTheme : [],
        codeBlockTheme,
        lineNumbers ? showLineNumbers() : [],
        maxHeight === null
          ? []
          : EditorView.theme({
              "&": { maxHeight: `${maxHeight}px` },
            }),
        wrap ? EditorView.lineWrapping : [],
      ],
    });
    editor.current = view;
    let active = true;

    if (customLanguage) {
      void customLanguage()
        .then((extension) => {
          if (active) {
            view.dispatch({ effects: languageCompartment.reconfigure(extension) });
          }
        })
        .catch((error: unknown) => {
          if (active) {
            console.warn("[lattice] CodeBlock language failed to load.", error);
          }
        });
    }

    return () => {
      active = false;
      editor.current = null;
      view.destroy();
    };
  }, [copyable, language, lineNumbers, maxHeight, wrap]);

  useEffect(() => {
    const view = editor.current;

    if (!view || view.state.doc.toString() === children) {
      return;
    }

    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: children } });
  }, [children]);

  return <div ref={container} />;
}

export default CodeBlockView;

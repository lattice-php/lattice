import { useMemo, useState } from "react";
import type { Node } from "@lattice-php/core";
import { useAutosave } from "../../autosave";
import { createEditorStore, seedDocument } from "../../document/store";
import type { EditorEndpoint } from "../../endpoint";
import { Inspector } from "../inspector/inspector";
import { Canvas } from "./canvas";
import { EditorProvider, useBlockElements, type EditorContextValue } from "./editor-context";
import { EditorTopbar } from "./editor-topbar";
import { useInlineFocus } from "./focus-registry";
import { handleEditorKeyDown } from "./keyboard";
import { LibraryPanel } from "./library-panel";
import { useInsertActions } from "./use-insert";
import { useRenderQueue } from "./use-render-queue";

export default function BlockEditorView({ node }: { node: Node<"blocks.editor"> }) {
  const {
    document,
    rendered,
    types,
    patterns,
    revision,
    endpoint: url,
    ref,
    previewUrl,
    title,
    seedType,
    styleClasses,
  } = node.props;
  const [store] = useState(() =>
    createEditorStore({
      document: seedDocument(document, types, seedType),
      patterns,
      rendered,
      revision,
      seedType,
      types,
    }),
  );
  const endpoint = useMemo<EditorEndpoint | null>(
    () => (url && ref ? { ref, url } : null),
    [ref, url],
  );
  const { registerBlock, focusBlock } = useBlockElements();
  const inline = useInlineFocus();
  const requestRender = useRenderQueue(store, endpoint);
  const { insertBlock, insertPattern } = useInsertActions({
    focusBlock,
    inline,
    requestRender,
    store,
    types,
  });

  const { saveNow } = useAutosave(store, endpoint);

  const context = useMemo<EditorContextValue>(
    () => ({
      endpoint,
      focusBlock,
      inline,
      insertBlock,
      insertPattern,
      registerBlock,
      requestRender,
      saveNow,
      store,
      styleClasses,
      types,
    }),
    [
      endpoint,
      focusBlock,
      inline,
      insertBlock,
      insertPattern,
      registerBlock,
      requestRender,
      saveNow,
      store,
      styleClasses,
      types,
    ],
  );

  return (
    <EditorProvider value={context}>
      <div
        className="fixed inset-0 z-30 flex flex-col bg-lt-bg text-lt-fg"
        data-test="blocks-editor"
        onKeyDown={(event) => handleEditorKeyDown(event, store, focusBlock)}
      >
        <EditorTopbar title={title} previewUrl={previewUrl} />
        <div className="flex min-h-0 flex-1">
          <LibraryPanel />
          <Canvas />
          <Inspector />
        </div>
      </div>
    </EditorProvider>
  );
}

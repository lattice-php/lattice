import { useMemo, useState } from "react";
import type { Node } from "@lattice-php/core";
import { useAutosave } from "../../autosave";
import { createEditorStore } from "../../document/store";
import type { EditorEndpoint } from "../../endpoint";
import { Inspector } from "../inspector/inspector";
import { Canvas } from "./canvas";
import { EditorProvider, useBlockElements, type EditorContextValue } from "./editor-context";
import { EditorTopbar } from "./editor-topbar";
import { handleEditorKeyDown } from "./keyboard";
import { LibraryPanel } from "./library-panel";
import { useRenderQueue } from "./use-render-queue";

export default function BlockEditorView({ node }: { node: Node<"blocks.editor"> }) {
  const { document, rendered, types, revision, endpoint: url, ref, previewUrl, title } = node.props;
  const [store] = useState(() => createEditorStore({ document, rendered, revision, types }));
  const endpoint = useMemo<EditorEndpoint | null>(
    () => (url && ref ? { ref, url } : null),
    [ref, url],
  );
  const { registerBlock, focusBlock } = useBlockElements();
  const requestRender = useRenderQueue(store, endpoint);

  useAutosave(store, endpoint);

  const context = useMemo<EditorContextValue>(
    () => ({ endpoint, focusBlock, registerBlock, requestRender, store, types }),
    [endpoint, focusBlock, registerBlock, requestRender, store, types],
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

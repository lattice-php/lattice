import { useEffect } from "react";
import { RenderNode } from "@lattice-php/core";
import { useT } from "@lattice-php/ui/i18n";
import { Spinner } from "@lattice-php/ui/primitives/spinner";
import { useEditor, useEditorState } from "./editor-context";

export function BlockList({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.map((id) => (
        <EditorBlock key={id} id={id} />
      ))}
    </>
  );
}

function EditorBlock({ id }: { id: string }) {
  const rendered = useEditorState((state) => state.rendered[id]);

  return rendered ? <RenderNode node={rendered} /> : <BlockPlaceholder id={id} />;
}

function BlockPlaceholder({ id }: { id: string }) {
  const { t } = useT("blocks");
  const { requestRender } = useEditor();

  useEffect(() => {
    requestRender(id);
  }, [id, requestRender]);

  return (
    <div
      className="flex h-16 items-center justify-center gap-2 rounded-lt border border-dashed border-lt-border text-sm text-lt-muted-fg"
      data-test={`block-${id}`}
      data-block-pending
    >
      <Spinner />
      {t("blocks.editor.rendering", "Rendering…")}
    </div>
  );
}

import { useState } from "react";
import { Button } from "@lattice-php/ui/components/button/button";
import { SegmentedControl } from "@lattice-php/ui/components/segmented-control/segmented-control";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { IconButton } from "@lattice-php/ui/primitives/icon-button";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { publishDocument } from "../../endpoint";
import {
  markConflict,
  markError,
  markPublished,
  markPublishing,
  overwriteConflict,
  redo,
  setCanvasWidth,
  setErrors,
  undo,
  type SaveState,
} from "../../document/store";
import type { CanvasWidth } from "../../types";
import { ConflictDialog } from "./conflict-dialog";
import { useEditor, useEditorState } from "./editor-context";

const canvasWidths: CanvasWidth[] = ["desktop", "tablet", "mobile"];

export function EditorTopbar({
  title,
  previewUrl,
}: {
  title: string | null;
  previewUrl: string | null;
}) {
  const { t } = useT("blocks");
  const { store, endpoint, saveNow } = useEditor();
  const canUndo = useEditorState((state) => state.history.past.length > 0);
  const canRedo = useEditorState((state) => state.history.future.length > 0);
  const saveState = useEditorState((state) => state.saveState);
  const publishing = useEditorState((state) => state.publishing);
  const publishedAt = useEditorState((state) => state.publishedAt);
  const canvasWidth = useEditorState((state) => state.canvasWidth);
  const [overwriting, setOverwriting] = useState(false);
  const dispatch = useEffectDispatcher();
  const toast = (message: string, variant: "success" | "danger") =>
    dispatch([{ props: { message, variant }, type: "toast" }]);

  const publish = async () => {
    if (!endpoint) {
      return;
    }

    store.setState((state) => markPublishing(state, true));
    const { document, revision } = store.getState();

    try {
      const result = await publishDocument(endpoint, document, revision);

      store.setState((state) => {
        switch (result.status) {
          case "saved":
            return markPublished(state, result.revision, document);
          case "conflict":
            return markPublishing(markConflict(state, result.revision), false);
          case "invalid":
            return markPublishing(setErrors(state, result.errors), false);
          case "failed":
            return markPublishing(markError(state), false);
        }
      });

      if (result.status === "saved") {
        toast(t("blocks.editor.publish-succeeded", "The page is published."), "success");
      } else if (result.status === "invalid") {
        toast(
          t(
            "blocks.editor.publish-failed",
            "Publishing failed. Fix the highlighted blocks and try again.",
          ),
          "danger",
        );
      }
    } catch {
      store.setState((state) => markPublishing(markError(state), false));
    }
  };

  const overwrite = async () => {
    setOverwriting(true);
    store.setState(overwriteConflict);

    try {
      await saveNow();
    } finally {
      setOverwriting(false);
    }
  };

  const widthLabels: Record<CanvasWidth, string> = {
    desktop: t("blocks.editor.width-desktop", "Desktop"),
    mobile: t("blocks.editor.width-mobile", "Mobile"),
    tablet: t("blocks.editor.width-tablet", "Tablet"),
  };

  return (
    <header
      className="flex h-12 shrink-0 items-center gap-2 border-b border-lt-border bg-lt-surface px-3"
      data-test="blocks-topbar"
    >
      <IconButton
        icon="undo-2"
        size="md"
        label={t("blocks.editor.undo", "Undo")}
        disabled={!canUndo}
        onClick={() => store.setState(undo)}
        data-test="blocks-undo"
      />
      <IconButton
        icon="redo-2"
        size="md"
        label={t("blocks.editor.redo", "Redo")}
        disabled={!canRedo}
        onClick={() => store.setState(redo)}
        data-test="blocks-redo"
      />
      <div className="mx-2 flex min-w-0 flex-1 items-center justify-center gap-2 text-sm">
        {title && <span className="truncate font-semibold text-lt-fg">{title}</span>}
        <SaveStatus state={saveState} publishedAt={publishedAt} />
      </div>
      <SegmentedControl
        aria-label={t("blocks.editor.canvas-width", "Canvas width")}
        data-test="blocks-canvas-width"
        className="hidden md:inline-flex"
        options={canvasWidths.map((width) => ({ label: widthLabels[width], value: width }))}
        value={canvasWidth}
        onValueChange={(value) =>
          store.setState((state) => setCanvasWidth(state, value as CanvasWidth))
        }
      />
      {previewUrl && (
        <Button emphasis="outline" variant="secondary" size="sm" asChild>
          <a href={previewUrl} target="_blank" rel="noreferrer" data-test="blocks-preview">
            <Icon name="external-link" />
            {t("blocks.editor.preview", "Preview")}
          </a>
        </Button>
      )}
      <Button
        size="sm"
        disabled={publishing || saveState === "conflict" || !endpoint}
        onClick={() => void publish()}
        data-test="blocks-publish"
      >
        {publishing
          ? t("blocks.editor.publishing", "Publishing…")
          : t("blocks.editor.publish", "Publish")}
      </Button>
      <ConflictDialog
        open={saveState === "conflict"}
        overwriting={overwriting}
        onReload={() => window.location.reload()}
        onOverwrite={() => void overwrite()}
      />
    </header>
  );
}

function SaveStatus({ state, publishedAt }: { state: SaveState; publishedAt: number | null }) {
  const { t } = useT("blocks");
  const labels: Record<SaveState, string> = {
    conflict: t("blocks.editor.conflict", "Changed elsewhere"),
    dirty: t("blocks.editor.unsaved", "Unsaved changes"),
    error: t("blocks.editor.save-failed", "Could not save"),
    idle: "",
    saved:
      publishedAt !== null
        ? t("blocks.editor.published", "Published")
        : t("blocks.editor.saved", "Draft saved"),
    saving: t("blocks.editor.saving", "Saving…"),
  };

  return (
    <span
      className={cn(
        "text-xs",
        state === "conflict" || state === "error" ? "text-lt-danger" : "text-lt-muted-fg",
      )}
      data-test="blocks-save-state"
      data-save-state={state}
      role="status"
    >
      {labels[state]}
    </span>
  );
}

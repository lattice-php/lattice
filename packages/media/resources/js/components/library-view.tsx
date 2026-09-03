import { useRef, useState } from "react";
import { useAction } from "@lattice-php/action/hooks/use-action";
import type { Node } from "@lattice-php/core/types";
import { translate, useT } from "@lattice-php/ui/i18n";
import { useDebouncedCallback } from "@lattice-php/ui/lib/use-debounced-callback";
import { useMediaQuery } from "@lattice-php/ui/lib/use-media-query";
import { usePersistentState } from "@lattice-php/ui/lib/use-persistent-state";
import { cn } from "@lattice-php/ui/lib/utils";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/ui/primitives/dialog";
import { useTable } from "@lattice-php/table/hooks/use-table";
import { useTableSelection } from "@lattice-php/table/hooks/use-table-selection";
import { getBulkActionNodes } from "@lattice-php/table/lib/bulk";
import type { TableNode } from "@lattice-php/table/types";
import { Button } from "@lattice-php/ui/components/button/button";
import { Inspector, SelectionSummary } from "./inspector";
import { LibraryToolbar, sortsFor, type SortChoice } from "./library-toolbar";
import { MediaGrid } from "./media-grid";
import { MediaList } from "./media-list";
import type { MediaRow, PickMode, ViewMode } from "./media-row";
import { UploadList } from "./upload-list";
import { useMediaUpload } from "./use-media-upload";

export type { MediaRow, PickMode } from "./media-row";

const SEARCH_DEBOUNCE_MS = 300;
/** Tailwind's `lg`: below it the inspector is a slideout instead of a column. */
const INSPECTOR_INLINE_QUERY = "(min-width: 64rem)";

function actionNode(node: Node, key: string): Node<"action"> | undefined {
  return node.schema?.find((child) => child.key === key) as Node<"action"> | undefined;
}

/**
 * The grid face of the media table: it drives the same `useTable` state the
 * core table component does, so search, filters, infinite paging and the
 * `reload-component` effect all behave identically — only the presentation and
 * the selection affordances differ.
 */
export function LibraryView({ node, pick }: { node: Node; pick?: PickMode }) {
  const { t } = useT("media");
  const props = (node.props ?? {}) as Node<"media.library">["props"];
  const tableNode = (node.schema?.find((child) => child.type === "table") ?? {
    type: "table",
  }) as TableNode;
  const table = useTable(tableNode);
  const rows = table.rows as MediaRow[];
  const selection = useTableSelection(rows.map((row) => String(row.id)));
  const [deleteAction] = getBulkActionNodes(tableNode.props?.bulkActions);
  const uploadAction = actionNode(node, "media-upload");
  const updateAction = actionNode(node, "media-update");
  const removeAction = actionNode(node, "media-delete");
  const { uploads, addFiles, retry, dismiss } = useMediaUpload({
    endpoint: uploadAction?.props.endpoint ?? "",
    ref: uploadAction?.props.ref ?? "",
    signed: props.signed,
  });
  const [view, setView] = usePersistentState<ViewMode>("lattice:media:view", "grid");
  const [sort, setSort] = useState<SortChoice>("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const anchorIndex = useRef<number | null>(null);
  const inlineInspector = useMediaQuery(INSPECTOR_INLINE_QUERY, true);
  const uploadLabel = uploadAction?.props.label ?? t("media.actions.upload.label", "Upload");
  const reloading = table.processing && table.hasLoaded;
  const commitSearch = useDebouncedCallback(
    (term: string) => table.setSearch(term),
    SEARCH_DEBOUNCE_MS,
  );
  const inspectable =
    pick === undefined &&
    props.inspector !== false &&
    updateAction !== undefined &&
    removeAction !== undefined;
  const activeRow = inspectable ? (rows.find((row) => row.id === activeId) ?? null) : null;
  const selectedRows = rows.filter((row) => selection.isSelected(String(row.id)));
  // The slideout covers the drop zone, so a drop landing there would upload
  // behind an open panel; inline it sits beside the grid and never does.
  const acceptsDrop = inlineInspector || activeRow === null;
  const sortableKeys = table.columns
    .filter((column) => column.props.sortable === true)
    .map((column) => column.key);

  function applySort(choice: SortChoice): void {
    setSort(choice);
    table.setSorts(sortsFor(choice));
  }

  function activate(row: MediaRow, index: number, shiftKey: boolean): void {
    if (pick) {
      toggle(row, index, shiftKey);

      return;
    }

    setActiveId(row.id);
    anchorIndex.current = index;
  }

  function toggle(row: MediaRow, index: number, shiftKey: boolean): void {
    const key = String(row.id);
    const wasSelected = selection.isSelected(key);

    if (pick && !pick.multiple) {
      selection.clear();
      anchorIndex.current = index;

      if (wasSelected) {
        return;
      }

      selection.toggle(key);

      return;
    }

    if (shiftKey && anchorIndex.current !== null) {
      selectRange(anchorIndex.current, index);

      return;
    }

    anchorIndex.current = index;

    if (pick?.max !== undefined && !wasSelected && selection.selectedKeys.length >= pick.max) {
      return;
    }

    selection.toggle(key);
  }

  /**
   * Shift-click extends the selection; the range always ends up selected.
   * The running count is local because `selectedKeys` only catches up after
   * the whole batch of toggles has been applied.
   */
  function selectRange(from: number, to: number): void {
    const [start, end] = from <= to ? [from, to] : [to, from];
    let selected = selection.selectedKeys.length;

    for (const row of rows.slice(start, end + 1)) {
      const key = String(row.id);

      if (selection.isSelected(key)) {
        continue;
      }

      if (pick?.max !== undefined && selected >= pick.max) {
        return;
      }

      selection.toggle(key);
      selected += 1;
    }
  }

  const listProps = {
    activeId: activeRow?.id ?? null,
    isSelected: (row: MediaRow) => selection.isSelected(String(row.id)),
    onActivate: activate,
    onToggle: toggle,
    reloading,
    rows,
  };

  const panel =
    activeRow !== null && updateAction && removeAction ? (
      <Inspector
        key={activeRow.id}
        onClose={() => setActiveId(null)}
        onDeleted={() => setActiveId(null)}
        remove={removeAction}
        row={activeRow}
        update={updateAction}
      />
    ) : selectedRows.length > 1 ? (
      <SelectionSummary rows={selectedRows} />
    ) : (
      <p className="text-sm text-lt-muted-fg" data-test="media-inspector-empty">
        {t("media.detail.empty", "Select a file to see its details.")}
      </p>
    );

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lt-sm border border-dashed border-transparent",
        dragActive && "border-lt-primary",
      )}
      data-test="media-library"
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as HTMLElement | null)) {
          setDragActive(false);
        }
      }}
      onDragOver={(event) => {
        // HTML5 DnD only treats an element as a drop target if dragover is
        // canceled; skipping this when the guard is closed lets the browser
        // fall back to its native drop handling (navigating the tab to the
        // dropped file), so preventDefault always runs first.
        event.preventDefault();

        if (!acceptsDrop) {
          return;
        }

        setDragActive(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);

        if (!acceptsDrop) {
          return;
        }

        addFiles(event.dataTransfer.files);
      }}
    >
      <LibraryToolbar
        accept={props.accept}
        defaultSearch={table.search}
        onFiles={uploadAction?.props.endpoint ? addFiles : null}
        onSearch={commitSearch}
        onSortChange={applySort}
        onTypeChange={(type) => table.setTableFilter("type", { value: type })}
        onViewChange={setView}
        sort={sort}
        sortableKeys={sortableKeys}
        uploadLabel={uploadLabel}
        view={view}
      />

      <UploadList dismiss={dismiss} retry={retry} uploads={uploads} />

      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {rows.length === 0 && table.hasLoaded ? (
            <p className="py-12 text-center text-sm text-lt-muted-fg" data-test="media-empty">
              {table.search !== "" || Object.keys(table.tableFilters).length > 0
                ? t("media.library.no-results", "No media matches your search.")
                : t("media.library.empty", "No media yet. Drop files anywhere to upload.")}
            </p>
          ) : view === "list" ? (
            <MediaList {...listProps} />
          ) : (
            <MediaGrid {...listProps} />
          )}
          <div ref={table.infiniteLoaderRef} />
        </div>

        {inspectable && inlineInspector && (
          <aside
            className="w-80 shrink-0 rounded-lt-sm border border-lt-border bg-lt-surface p-4"
            data-test="media-inspector"
          >
            {panel}
          </aside>
        )}
      </div>

      {inspectable && !inlineInspector && (
        <Dialog open={activeRow !== null} onOpenChange={() => setActiveId(null)}>
          <DialogContent
            aria-describedby={undefined}
            data-test="media-inspector"
            placement="end"
            width="md"
          >
            <DialogHeader
              closeLabel={translate("lattice", "common.close", "Close")}
              title={activeRow?.name ?? ""}
            />
            {panel}
          </DialogContent>
        </Dialog>
      )}

      {pick ? (
        <div className="flex items-center justify-end gap-3 border-t border-lt-border pt-3">
          {pick.max !== undefined && (
            <span
              className={cn(
                "text-sm text-lt-muted-fg",
                selection.selectedKeys.length >= pick.max && "text-lt-danger",
              )}
              data-test="media-pick-counter"
            >
              {t("media.picker.selected-of-max", "{{count}}/{{max}} selected", {
                count: selection.selectedKeys.length,
                max: pick.max,
              })}
            </span>
          )}
          <Button
            data-test="media-pick-confirm"
            disabled={!selection.active}
            onClick={() => pick.onConfirm(selectedRows)}
            type="button"
            variant="primary"
          >
            {t("media.picker.confirm", "Select {{count}} item(s)", {
              count: selection.selectedKeys.length,
            })}
          </Button>
        </div>
      ) : (
        deleteAction &&
        selection.active && (
          <BulkDeleteBar
            action={deleteAction}
            onDone={selection.clear}
            selectedKeys={selection.selectedKeys}
          />
        )
      )}
    </div>
  );
}

function BulkDeleteBar({
  action,
  selectedKeys,
  onDone,
}: {
  action: Node<"action" | "action.bulk">;
  selectedKeys: string[];
  onDone: () => void;
}) {
  const { t } = useT("media");
  const { processing, requestSubmit } = useAction(action, {
    extraData: () => ({ selected: selectedKeys }),
    onSuccess: onDone,
  });

  return (
    <div className="sticky bottom-0 z-lt-sticky flex items-center justify-between gap-3 rounded-lt-sm border border-lt-border bg-lt-surface px-4 py-3 text-sm shadow-lt-md">
      <span>
        {t("media.library.selected", "{{count}} selected", { count: selectedKeys.length })}
      </span>
      <Button
        data-test="media-bulk-delete"
        disabled={processing}
        emphasis={action.props.emphasis ?? "solid"}
        onClick={requestSubmit}
        type="button"
        variant={action.props.variant ?? "danger"}
      >
        {action.props.label}
      </Button>
    </div>
  );
}

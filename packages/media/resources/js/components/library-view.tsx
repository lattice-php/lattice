import { useContext, useRef, useState } from "react";
import { useAction } from "@lattice-php/action/hooks/use-action";
import type { Node } from "@lattice-php/core/types";
import { useT } from "@lattice-php/ui/i18n";
import { useDebouncedCallback } from "@lattice-php/ui/lib/use-debounced-callback";
import { cn } from "@lattice-php/ui/lib/utils";
import { MODAL_MISSING_ERROR, useOptionalModal } from "@lattice-php/ui/modal";
import { useTable } from "@lattice-php/table/hooks/use-table";
import { useTableSelection } from "@lattice-php/table/hooks/use-table-selection";
import { getBulkActionNodes } from "@lattice-php/table/lib/bulk";
import type { TableNode } from "@lattice-php/table/types";
import { Button } from "@lattice-php/ui/components/button/button";
import { Checkbox } from "@lattice-php/ui/primitives/checkbox";
import { Input } from "@lattice-php/ui/primitives/input";
import { NativeSelect } from "@lattice-php/ui/primitives/native-select";
import { DetailPanel } from "./detail-panel";
import { UploadList } from "./upload-list";
import { useMediaUpload } from "./use-media-upload";

const SEARCH_DEBOUNCE_MS = 300;

export type MediaRow = {
  id: number;
  url: string | null;
  /** The library conversion when it was generated, the original otherwise. */
  preview_url: string | null;
  name: string;
  mime_type: string;
  size: number;
  alt: string | null;
  created_at: string;
  attachments_count: number;
};

export type PickMode = { multiple: boolean; max?: number; onConfirm: (items: MediaRow[]) => void };

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
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const host = useOptionalModal();
  const uploadLabel = uploadAction?.props.label ?? t("media.actions.upload.label", "Upload");
  // The panel now portals at the app root through the modal host, so its drag
  // events no longer reach this wrapper in a real browser — a drop just falls
  // through to the browser's default handling, like any other host modal (a
  // document-level guard would fix that; out of scope here). The detailId
  // check still matters: it is what the jsdom drop test below exercises
  // directly, since fireEvent skips the portal boundary entirely.
  const acceptsDrop = detailId === null;
  const reloading = table.processing && table.hasLoaded;
  const commitSearch = useDebouncedCallback(
    (term: string) => table.setSearch(term),
    SEARCH_DEBOUNCE_MS,
  );

  function openDetail(row: MediaRow): void {
    if (!updateAction || !removeAction) {
      return;
    }

    if (!host) {
      throw new Error(MODAL_MISSING_ERROR);
    }

    setDetailId(row.id);
    host.open(
      <DetailPanel
        onClose={() => setDetailId(null)}
        remove={removeAction}
        row={row}
        update={updateAction}
      />,
    );
  }

  function toggle(row: MediaRow): void {
    const key = String(row.id);
    const wasSelected = selection.isSelected(key);

    if (pick && !pick.multiple) {
      selection.clear();

      if (wasSelected) {
        return;
      }
    }

    if (pick?.max !== undefined && !wasSelected && selection.selectedKeys.length >= pick.max) {
      return;
    }

    selection.toggle(key);
  }

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
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs"
          data-test="media-search"
          defaultValue={table.search}
          onChange={(event) => commitSearch(event.target.value)}
          placeholder={t("media.library.search", "Search media")}
          type="search"
        />
        <NativeSelect
          aria-label={t("media.filters.type.label", "Type")}
          className="max-w-40"
          data-test="media-type-filter"
          defaultValue=""
          onChange={(event) => table.setTableFilter("type", { value: event.target.value })}
        >
          <option value="">{t("media.filters.type.all", "All types")}</option>
          <option value="image">{t("media.filters.type.image", "Images")}</option>
          <option value="video">{t("media.filters.type.video", "Video")}</option>
          <option value="audio">{t("media.filters.type.audio", "Audio")}</option>
          <option value="document">{t("media.filters.type.document", "Documents")}</option>
        </NativeSelect>
        {uploadAction?.props.endpoint && (
          <>
            <Button
              className="ms-auto"
              data-test="media-upload-button"
              onClick={() => fileInput.current?.click()}
              type="button"
              variant="primary"
            >
              {uploadLabel}
            </Button>
            <input
              accept={props.accept ?? undefined}
              aria-label={uploadLabel}
              className="sr-only"
              data-test="media-upload-input"
              multiple
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
              ref={fileInput}
              type="file"
            />
          </>
        )}
      </div>

      <UploadList dismiss={dismiss} retry={retry} uploads={uploads} />

      {rows.length === 0 && table.hasLoaded ? (
        <p className="py-12 text-center text-sm text-lt-muted-fg" data-test="media-empty">
          {table.search !== "" || Object.keys(table.tableFilters).length > 0
            ? t("media.library.no-results", "No media matches your search.")
            : t("media.library.empty", "No media yet. Drop files anywhere to upload.")}
        </p>
      ) : (
        <ul
          aria-busy={reloading}
          className={cn(
            "grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-5",
            reloading && "opacity-60",
          )}
          data-test="media-grid"
        >
          {rows.map((row) => (
            <li className="relative" key={row.id}>
              <button
                className={cn(
                  "flex w-full flex-col overflow-hidden rounded-lt-sm border border-lt-border bg-lt-surface text-left",
                  selection.isSelected(String(row.id)) &&
                    "ring-[length:var(--lt-ring-width)] ring-lt-ring",
                )}
                data-test="media-card"
                onClick={() => (pick ? toggle(row) : openDetail(row))}
                type="button"
              >
                {row.preview_url !== null && row.mime_type.startsWith("image/") ? (
                  <img
                    alt={row.alt ?? row.name}
                    className="aspect-square w-full object-cover"
                    src={row.preview_url}
                  />
                ) : (
                  <span className="flex aspect-square w-full items-center justify-center text-sm text-lt-muted-fg">
                    {row.mime_type.split("/")[1] ?? row.mime_type}
                  </span>
                )}
                <span className="truncate px-2 py-1.5 text-sm text-lt-fg">{row.name}</span>
              </button>
              <Checkbox
                aria-label={t("media.library.select", "Select {{name}}", { name: row.name })}
                checked={selection.isSelected(String(row.id))}
                className="absolute left-2 top-2 bg-lt-surface"
                data-test="media-card-select"
                onCheckedChange={() => toggle(row)}
              />
            </li>
          ))}
        </ul>
      )}

      <div ref={table.infiniteLoaderRef} />

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
            onClick={() =>
              pick.onConfirm(rows.filter((row) => selection.isSelected(String(row.id))))
            }
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

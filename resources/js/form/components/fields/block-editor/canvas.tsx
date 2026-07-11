import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect } from "react";
import type { Node } from "@lattice-php/lattice/core/types";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import { AddRowMenu } from "@lattice-php/lattice/form/components/fields/add-row-menu";
import {
  ROW_ID_KEY,
  type RepeaterRow,
} from "@lattice-php/lattice/form/components/fields/repeater-rows";
import type { RowTemplate } from "@lattice-php/lattice/form/components/fields/row-templates";
import { encodePath, resolveMove } from "./dnd";
import { childList, type BlockPath } from "./tree";

type CanvasShared = {
  templates: RowTemplate[];
  addLabel: string;
  wireFor: (rowId: string) => Node[];
  onPreviewSeed: (row: RepeaterRow) => void;
  selectedId: string | null;
  onSelect: (rowId: string) => void;
  onRemove: (path: BlockPath) => void;
  onAppend: (path: BlockPath, slot: string, type: string) => void;
};

type Props = CanvasShared & {
  rows: RepeaterRow[];
  onMoveBlock: (from: BlockPath, to: BlockPath) => void;
};

function EmptySlot({ prefix }: { prefix: BlockPath }) {
  const { setNodeRef, isOver } = useDroppable({ id: encodePath([...prefix, { index: 0 }]) });
  const { t } = useT("lattice");

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lt border border-dashed border-lt-border p-3 text-center text-sm text-lt-muted-fg",
        isOver && "border-lt-primary",
      )}
    >
      {t("form.block-editor.empty-slot", "Drop blocks here")}
    </div>
  );
}

function SlotArea({
  parentPath,
  slot,
  rows,
  shared,
}: {
  parentPath: BlockPath;
  slot: string;
  rows: RepeaterRow[];
  shared: CanvasShared;
}) {
  const last = parentPath[parentPath.length - 1];
  const prefix: BlockPath = [...parentPath.slice(0, -1), { ...last, slot }];
  const ids = rows.map((_, index) => encodePath([...prefix, { index }]));
  const options = shared.templates.map((template) => ({
    type: template.type,
    label: template.label,
  }));

  return (
    <div data-test={`block-slot-${slot}`} className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-lt-muted-fg">{slot}</span>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {rows.map((row, index) => (
            <Shell
              key={String(row[ROW_ID_KEY])}
              row={row}
              path={[...prefix, { index }]}
              shared={shared}
            />
          ))}
          {rows.length === 0 && <EmptySlot prefix={prefix} />}
        </div>
      </SortableContext>
      <AddRowMenu
        addLabel={shared.addLabel}
        options={options}
        onSelect={(type) => shared.onAppend(parentPath, slot, type)}
      />
    </div>
  );
}

function Shell({ row, path, shared }: { row: RepeaterRow; path: BlockPath; shared: CanvasShared }) {
  const id = encodePath(path);
  const rowId = String(row[ROW_ID_KEY]);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const { t } = useT("lattice");
  const template = shared.templates.find((candidate) => candidate.type === row.type);
  const slots = template?.slots ?? [];

  useEffect(() => {
    if (slots.length === 0) {
      shared.onPreviewSeed(row);
    }
    // fetch once per mount; the preview cache dedupes by content signature
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      role="option"
      data-test={`block-shell-${rowId}`}
      aria-selected={shared.selectedId === rowId}
      onClick={(e) => {
        e.stopPropagation();
        shared.onSelect(rowId);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (e.key === " ") {
            e.preventDefault();
          }
          e.stopPropagation();
          shared.onSelect(rowId);
        }
      }}
      tabIndex={0}
      className={cn(
        "cursor-pointer rounded-lt border p-2",
        shared.selectedId === rowId
          ? "border-lt-primary ring-1 ring-lt-primary"
          : "border-transparent hover:border-lt-border",
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <button
          type="button"
          aria-label={t("form.block-editor.drag-to-reorder", "Drag to reorder")}
          data-test={`block-drag-${rowId}`}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab text-lt-muted-fg hover:text-lt-fg active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          {t("form.block-editor.drag", "Drag")}
        </button>
        <span className="text-xs font-medium text-lt-muted-fg">
          {template?.label ?? String(row.type ?? "")}
        </span>
        <button
          type="button"
          aria-label={t("form.block-editor.remove", "Remove block")}
          data-test={`block-remove-${rowId}`}
          onClick={(e) => {
            e.stopPropagation();
            shared.onRemove(path);
          }}
          className="ml-auto text-lt-muted-fg hover:text-lt-danger [&_svg]:size-lt-icon-sm"
        >
          <Icon name="x" />
        </button>
      </div>
      {slots.length === 0 ? (
        <Renderer nodes={shared.wireFor(rowId)} />
      ) : (
        <div className="flex flex-col gap-3">
          {slots.map((slot) => (
            <SlotArea
              key={slot}
              parentPath={path}
              slot={slot}
              rows={childList(row, slot)}
              shared={shared}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BlockCanvas({ rows, onMoveBlock, ...shared }: Props) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const onDragEnd = (event: DragEndEvent): void => {
    const over = event.over;

    if (!over || over.id === event.active.id) {
      return;
    }

    const { from, to } = resolveMove(String(event.active.id), String(over.id));
    onMoveBlock(from, to);
  };

  const ids = rows.map((_, index) => encodePath([{ index }]));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2" role="listbox" aria-label="Blocks">
          {rows.map((row, index) => (
            <Shell key={String(row[ROW_ID_KEY])} row={row} path={[{ index }]} shared={shared} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

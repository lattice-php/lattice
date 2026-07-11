import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  pointerWithin,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { CollisionDetection, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import type {
  RowTemplate,
  RowTemplateSlot,
} from "@lattice-php/lattice/form/components/fields/row-templates";
import { dropDepth, resolveDrop, slotDropId } from "./dnd";
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

function EmptySlot({ parentRowId, slot }: { parentRowId: string; slot: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: slotDropId(parentRowId, slot) });
  const { t } = useT("lattice");

  return (
    <div
      ref={setNodeRef}
      data-test={`block-slot-drop-${slot}`}
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
  parentRowId,
  slot,
  rows,
  shared,
}: {
  parentPath: BlockPath;
  parentRowId: string;
  slot: RowTemplateSlot;
  rows: RepeaterRow[];
  shared: CanvasShared;
}) {
  const last = parentPath[parentPath.length - 1];
  const prefix: BlockPath = [...parentPath.slice(0, -1), { ...last, slot: slot.name }];
  const ids = rows.map((row) => String(row[ROW_ID_KEY]));
  const allowed = slot.blocks
    ? shared.templates.filter((template) => slot.blocks?.includes(template.type))
    : shared.templates;
  const options = allowed.map((template) => ({
    type: template.type,
    label: template.label,
  }));

  return (
    <div data-test={`block-slot-${slot.name}`} className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-lt-muted-fg">
        {slot.name}
      </span>
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
          {rows.length === 0 && <EmptySlot parentRowId={parentRowId} slot={slot.name} />}
        </div>
      </SortableContext>
      <AddRowMenu
        addLabel={shared.addLabel}
        options={options}
        onSelect={(type) => shared.onAppend(parentPath, slot.name, type)}
      />
    </div>
  );
}

function Shell({ row, path, shared }: { row: RepeaterRow; path: BlockPath; shared: CanvasShared }) {
  const rowId = String(row[ROW_ID_KEY]);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: rowId });
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
              key={slot.name}
              parentPath={path}
              parentRowId={rowId}
              slot={slot}
              rows={childList(row, slot.name)}
              shared={shared}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BlockCanvas({ rows, onMoveBlock, ...shared }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Prefer the deepest droppable under the pointer so nested shells and slot
  // placeholders win over the ancestors that spatially contain them.
  const deepestUnderPointer: CollisionDetection = (args) => {
    const within = pointerWithin(args).filter((collision) => collision.id !== args.active.id);

    if (within.length > 0) {
      return [
        within.reduce((best, collision) =>
          dropDepth(rows, String(collision.id)) > dropDepth(rows, String(best.id))
            ? collision
            : best,
        ),
      ];
    }

    return closestCenter(args);
  };

  const onDragEnd = (event: DragEndEvent): void => {
    const over = event.over;

    if (!over || over.id === event.active.id) {
      return;
    }

    const move = resolveDrop(rows, String(event.active.id), String(over.id));

    if (move) {
      onMoveBlock(move.from, move.to);
    }
  };

  const ids = rows.map((row) => String(row[ROW_ID_KEY]));

  return (
    <DndContext sensors={sensors} collisionDetection={deepestUnderPointer} onDragEnd={onDragEnd}>
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

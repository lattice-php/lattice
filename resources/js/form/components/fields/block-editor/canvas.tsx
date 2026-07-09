import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Node } from "@lattice-php/lattice/core/types";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import { ROW_ID_KEY, type RepeaterRow } from "../repeater-rows";
import { encodePath, resolveMove } from "./dnd";
import type { BlockPath } from "./move-block";

type Props = {
  rows: RepeaterRow[];
  wireFor: (rowId: string) => Node[];
  selectedId: string | null;
  onSelect: (rowId: string) => void;
  onMoveBlock: (from: BlockPath, to: BlockPath) => void;
};

function Shell({
  row,
  path,
  wireFor,
  selectedId,
  onSelect,
}: {
  row: RepeaterRow;
  path: BlockPath;
  wireFor: (rowId: string) => Node[];
  selectedId: string | null;
  onSelect: (rowId: string) => void;
}) {
  const id = encodePath(path);
  const rowId = String(row[ROW_ID_KEY]);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const { t } = useT("lattice");

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      role="option"
      data-test={`block-shell-${rowId}`}
      aria-selected={selectedId === rowId}
      onClick={() => onSelect(rowId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (e.key === " ") {
            e.preventDefault();
          }
          onSelect(rowId);
        }
      }}
      tabIndex={0}
      className={cn(
        "cursor-pointer rounded-lt border p-2",
        selectedId === rowId
          ? "border-lt-primary ring-1 ring-lt-primary"
          : "border-transparent hover:border-lt-border",
      )}
    >
      <button
        type="button"
        aria-label={t("form.block-editor.drag-to-reorder", "Drag to reorder")}
        data-test={`block-drag-${rowId}`}
        onClick={(e) => e.stopPropagation()}
        className="mb-1 cursor-grab text-lt-muted-fg hover:text-lt-fg active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        {t("form.block-editor.drag", "Drag")}
      </button>
      <Renderer nodes={wireFor(rowId)} />
    </div>
  );
}

export function BlockCanvas({ rows, wireFor, selectedId, onSelect, onMoveBlock }: Props) {
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
            <Shell
              key={String(row[ROW_ID_KEY])}
              row={row}
              path={[{ index }]}
              wireFor={wireFor}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

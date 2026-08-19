import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RenderNode } from "@lattice-php/core";
import type { Node, RendererComponent } from "@lattice-php/core";
import { announce, combine, draggable } from "@lattice-php/lattice/dnd";
import type { TreeItemInstruction } from "@lattice-php/lattice/dnd";
import {
  AddRowMenu,
  FieldScopeProvider,
  FormFieldFrame,
  ROW_ID_KEY,
  RowKeyInputs,
  useDependentField,
  useFieldScope,
  useFormContext,
  useFormValue,
  useRowCollection,
  useSetFormValue,
  withRowId,
} from "@lattice-php/form/toolkit";
import { useT } from "@lattice-php/ui/i18n";
import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import { canPlace, childrenOf, CHILDREN_KEY, moveNode, type TreeRow } from "./tree-field-rows";
import { dropIndicatorClass, treeItemDragData, treeItemDropTarget } from "./tree-item-drop";

type TreeFieldApi = {
  dragType: string;
  locked: boolean;
  maxDepth: number | null;
  acceptsChildren: (row: TreeRow) => boolean;
  canPlace: (sourceRowId: string, parentRowId: string | null) => boolean;
  move: (sourceRowId: string, parentRowId: string | null, index: number, label: string) => void;
};

const TreeFieldContext = createContext<TreeFieldApi | null>(null);

function useTreeFieldApi(): TreeFieldApi {
  const api = useContext(TreeFieldContext);
  if (!api) {
    throw new Error("Tree field rows must render inside their tree field.");
  }
  return api;
}

const TreeFieldComponent: RendererComponent<"field.tree"> = ({ node }) => {
  const props = node.props;
  const { errors } = useFormContext();
  const { hidden, required, readOnly, disabled } = useDependentField(node);
  const scope = useFieldScope();
  const rootPath = scope ? scope.errorKey(props.name) : props.name;
  const setValue = useSetFormValue();
  const value = useFormValue(rootPath);
  const { t } = useT("tree");
  const rowsRef = useRef<TreeRow[]>([]);
  rowsRef.current = Array.isArray(value) ? (value as TreeRow[]) : [];
  const locked = readOnly || disabled;

  const api = useMemo<TreeFieldApi>(() => {
    const acceptsChildren = (row: TreeRow): boolean =>
      props.childBearingTypes === null || props.childBearingTypes.includes(String(row.type));

    return {
      dragType: `tree-field:${rootPath}`,
      locked,
      maxDepth: props.maxDepth,
      acceptsChildren,
      canPlace: (sourceRowId, parentRowId) =>
        canPlace(rowsRef.current, sourceRowId, parentRowId, {
          maxDepth: props.maxDepth,
          acceptsChildren,
        }),
      move: (sourceRowId, parentRowId, index, label) => {
        setValue(rootPath, (previous: unknown) =>
          moveNode(
            Array.isArray(previous) ? (previous as TreeRow[]) : [],
            sourceRowId,
            parentRowId,
            index,
          ),
        );
        announce(t("tree.moved", "Moved {{label}}", { label }));
      },
    };
  }, [props.childBearingTypes, props.maxDepth, rootPath, locked, setValue, t]);

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={errors[rootPath]}
      helperText={props.helperText ?? undefined}
      tooltip={props.tooltip ?? undefined}
      label={props.label ?? ""}
      id={rootPath}
      required={required}
    >
      {(controlProps) => (
        <div {...controlProps} className="flex flex-col gap-3" role="group">
          <TreeFieldContext.Provider value={api}>
            <TreeLevel node={node} name={props.name} depth={1} parentRowId={null} />
          </TreeFieldContext.Provider>
        </div>
      )}
    </FormFieldFrame>
  );
};

function TreeLevel({
  node,
  name,
  depth,
  parentRowId,
}: {
  node: Node<"field.tree">;
  name: string;
  depth: number;
  parentRowId: string | null;
}) {
  const props = node.props;
  const api = useTreeFieldApi();
  const { t } = useT("tree");
  const { path, rows, onField, onRemove, onMove, append, insert } = useRowCollection(name, 0);
  const atMax = depth === 1 && props.maxItems !== null && rows.length >= props.maxItems;
  const atMin = depth === 1 && props.minItems !== null && rows.length <= props.minItems;
  const options = props.templates.map((template) => ({
    type: template.type,
    label: template.label,
  }));

  return (
    <>
      <RowKeyInputs path={path} rows={rows} rowKey={ROW_ID_KEY} />
      <RowKeyInputs path={path} rows={rows} rowKey="type" />
      {rows.map((row, index) => (
        <TreeFieldRow
          key={String(row[ROW_ID_KEY] ?? index)}
          node={node}
          row={row}
          index={index}
          depth={depth}
          path={path}
          parentRowId={parentRowId}
          siblingCount={rows.length}
          removable={!atMin}
          insertable={!atMax}
          options={options}
          onField={onField}
          onRemove={onRemove}
          onMove={onMove}
          onInsert={insert}
        />
      ))}
      {depth === 1 && !api.locked && !atMax && (
        <AddRowMenu
          addLabel={props.addLabel ?? t("tree.add", "Add")}
          options={options}
          onSelect={(type) => append({ type })}
        />
      )}
    </>
  );
}

function RowIconButton({
  label,
  testId,
  danger = false,
  onClick,
  children,
}: {
  label: string;
  testId: string;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-test={testId}
      className={cn(
        "[&_svg]:size-lt-icon-sm",
        danger ? "text-lt-danger hover:text-lt-danger" : "text-lt-muted-fg hover:text-lt-fg",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function TreeFieldRow({
  node,
  row,
  index,
  depth,
  path,
  parentRowId,
  siblingCount,
  removable,
  insertable,
  options,
  onField,
  onRemove,
  onMove,
  onInsert,
}: {
  node: Node<"field.tree">;
  row: TreeRow;
  index: number;
  depth: number;
  path: string;
  parentRowId: string | null;
  siblingCount: number;
  removable: boolean;
  insertable: boolean;
  options: { type: string; label: string }[];
  onField: (index: number, field: string, value: unknown) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, delta: number) => void;
  onInsert: (index: number, row: TreeRow) => void;
}) {
  const api = useTreeFieldApi();
  const { t } = useT("tree");
  const rowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dropInstruction, setDropInstruction] = useState<TreeItemInstruction["type"] | null>(null);
  const rowId = typeof row[ROW_ID_KEY] === "string" ? row[ROW_ID_KEY] : null;
  const template = node.props.templates.find((candidate) => candidate.type === row.type);
  const heading = template?.label ?? `Unknown block: ${String(row.type)}`;
  const holdsChildren = api.acceptsChildren(row) && (api.maxDepth === null || depth < api.maxDepth);
  const childCount = childrenOf(row).length;
  const draggableRow = !api.locked && rowId !== null;

  useEffect(() => {
    const element = rowRef.current;
    const handle = handleRef.current;

    if (!element || !draggableRow || rowId === null) {
      return;
    }

    return combine(
      ...(handle
        ? [
            draggable({
              element,
              dragHandle: handle,
              getInitialData: () => treeItemDragData(api.dragType, { id: rowId, label: heading }),
              onDragStart: () => setDragging(true),
              onDrop: () => setDragging(false),
            }),
          ]
        : []),
      treeItemDropTarget({
        element,
        dragType: api.dragType,
        currentLevel: depth - 1,
        mode:
          holdsChildren && childCount > 0
            ? "expanded"
            : index === siblingCount - 1
              ? "last-in-group"
              : "standard",
        canDrop: (source) => source.id !== rowId,
        blockedInstructions: (source) => {
          const block: TreeItemInstruction["type"][] = ["reparent"];

          if (!holdsChildren || !api.canPlace(source.id, rowId)) {
            block.push("make-child");
          }

          if (!api.canPlace(source.id, parentRowId)) {
            block.push("reorder-above", "reorder-below");
          }

          return block;
        },
        onInstruction: setDropInstruction,
        onDrop: (source, instruction) => {
          if (instruction.type === "reorder-above") {
            api.move(source.id, parentRowId, index, source.label);
          } else if (instruction.type === "reorder-below") {
            api.move(source.id, parentRowId, index + 1, source.label);
          } else if (instruction.type === "make-child") {
            api.move(source.id, rowId, childCount, source.label);
          }
        },
      }),
    );
  }, [
    api,
    childCount,
    depth,
    draggableRow,
    heading,
    holdsChildren,
    index,
    parentRowId,
    rowId,
    siblingCount,
  ]);

  return (
    <div
      ref={rowRef}
      data-test={`tree-field-${path}-row-${index}`}
      data-drop-instruction={dropInstruction ?? undefined}
      className={cn(
        "rounded-lt border border-lt-border bg-lt-surface p-4",
        dragging && "opacity-50",
        dropIndicatorClass(dropInstruction),
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!api.locked && (
            <button
              ref={handleRef}
              type="button"
              aria-label={t("tree.drag", "Drag {{label}}", { label: heading })}
              data-test={`tree-field-${path}-drag-${index}`}
              className="cursor-grab text-lt-muted-fg hover:text-lt-fg [&_svg]:size-lt-icon-sm"
            >
              <Icon name="grip-vertical" />
            </button>
          )}
          <span className="text-sm font-medium text-lt-muted-fg">{heading}</span>
        </div>
        {!api.locked && (
          <div className="flex items-center gap-1">
            {holdsChildren && (
              <AddRowMenu
                addLabel={t("tree.add_child", "Add sub-item")}
                icon="corner-down-right"
                testId={`tree-field-${path}-add-child-${index}`}
                options={options}
                onSelect={(type) =>
                  onField(index, CHILDREN_KEY, [...childrenOf(row), withRowId({ type })])
                }
              />
            )}
            {insertable && (
              <AddRowMenu
                addLabel={t("tree.add_below", "Add item below")}
                icon="list-plus"
                testId={`tree-field-${path}-add-below-${index}`}
                options={options}
                onSelect={(type) => onInsert(index + 1, { type })}
              />
            )}
            {node.props.reorderable && index > 0 && (
              <RowIconButton
                label={t("tree.move_up", "Move up")}
                testId={`tree-field-${path}-up-${index}`}
                onClick={() => onMove(index, -1)}
              >
                <Icon name="arrow-up" />
              </RowIconButton>
            )}
            {node.props.reorderable && index < siblingCount - 1 && (
              <RowIconButton
                label={t("tree.move_down", "Move down")}
                testId={`tree-field-${path}-down-${index}`}
                onClick={() => onMove(index, 1)}
              >
                <Icon name="arrow-down" />
              </RowIconButton>
            )}
            {removable && (
              <RowIconButton
                label={t("tree.remove", "Remove")}
                testId={`tree-field-${path}-remove-${index}`}
                danger
                onClick={() => onRemove(index)}
              >
                <Icon name="trash-2" />
              </RowIconButton>
            )}
          </div>
        )}
      </div>

      <FieldScopeProvider
        base={path}
        index={index}
        row={row}
        onChange={(field, value) => onField(index, field, value)}
      >
        <div className="flex flex-col gap-4">
          {(template?.schema ?? []).map((child, childIndex) => (
            <RenderNode key={childIndex} node={child} />
          ))}
        </div>
        {holdsChildren && (
          <div className="mt-3 flex flex-col gap-3 border-l-2 border-lt-border pl-4">
            <TreeLevel node={node} name={CHILDREN_KEY} depth={depth + 1} parentRowId={rowId} />
          </div>
        )}
      </FieldScopeProvider>
    </div>
  );
}

export default TreeFieldComponent;

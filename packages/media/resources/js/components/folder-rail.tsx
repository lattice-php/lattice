import { Renderer } from "@lattice-php/core/renderer";
import type { Node } from "@lattice-php/core/types";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { UNASSIGNED_FOLDER } from "./folders";

/**
 * The folder navigation beside the grid. Real folders come from the tree node
 * the library composed — lazy loading, keyboard navigation, drag-and-drop and
 * the per-folder actions are the tree package's, not ours. "All files" and
 * "Without folder" are ours: they are filter states, not folders.
 */
export function FolderRail({
  activeFolder,
  create,
  onSelect,
  tree,
}: {
  activeFolder: string;
  create?: Node<"action">;
  onSelect: (folder: string) => void;
  tree: Node;
}) {
  const { t } = useT("media");

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-1" data-test="media-folders">
      <FolderButton
        active={activeFolder === ""}
        label={t("media.folders.all", "All files")}
        onSelect={() => onSelect("")}
        testId="media-folder-all"
      />
      <FolderButton
        active={activeFolder === UNASSIGNED_FOLDER}
        label={t("media.folders.unassigned", "Without folder")}
        onSelect={() => onSelect(UNASSIGNED_FOLDER)}
        testId="media-folder-unassigned"
      />
      <Renderer
        nodes={[
          {
            ...tree,
            props: {
              ...tree.props,
              activeId: activeFolder === UNASSIGNED_FOLDER ? null : activeFolder,
            },
          },
        ]}
      />
      {create && <Renderer nodes={[create]} />}
    </aside>
  );
}

function FolderButton({
  active,
  label,
  onSelect,
  testId,
}: {
  active: boolean;
  label: string;
  onSelect: () => void;
  testId: string;
}) {
  return (
    <button
      aria-current={active}
      className={cn(
        "rounded-lt-sm px-2 py-1 text-start text-sm text-lt-fg hover:bg-lt-accent",
        active && "bg-lt-accent font-medium",
      )}
      data-test={testId}
      onClick={onSelect}
      type="button"
    >
      {label}
    </button>
  );
}

import { useMemo, useState } from "react";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { findBlock } from "../../document/tree";
import { useBlockType, useEditorState } from "../editor/editor-context";
import { AdvancedPanel } from "./advanced-panel";
import { ContentPanel } from "./content-panel";
import { StructurePanel } from "./structure-panel";
import { StylePanel } from "./style-panel";

type Tab = "style" | "content" | "advanced" | "structure";

export function Inspector() {
  const { t } = useT("blocks");
  const selectedId = useEditorState((state) => state.selectedId);
  const document = useEditorState((state) => state.document);
  const travelCount = useEditorState((state) => state.travelCount);
  const entry = useMemo(
    () => (selectedId ? findBlock(document, selectedId) : null),
    [document, selectedId],
  );
  const type = useBlockType(entry?.node.type ?? "");
  const [tab, setTab] = useState<Tab>("style");
  const hasContentFields = (type?.schema.length ?? 0) > 0;
  const activeTab: Tab = entry
    ? tab === "content" && !hasContentFields
      ? "style"
      : tab
    : "structure";

  const tabs: { key: Tab; label: string; hidden?: boolean }[] = [
    { key: "style", label: t("blocks.editor.inspector.style", "Style") },
    {
      hidden: !hasContentFields,
      key: "content",
      label: t("blocks.editor.inspector.content", "Content"),
    },
    { key: "advanced", label: t("blocks.editor.inspector.advanced", "Advanced") },
    { key: "structure", label: t("blocks.editor.inspector.structure", "Structure") },
  ];

  return (
    <aside
      className="flex w-80 shrink-0 flex-col border-l border-lt-border bg-lt-surface"
      data-test="blocks-inspector"
      data-blocks-inspector
      aria-label={t("blocks.editor.inspector.title", "Block")}
    >
      <div className="flex h-10 items-center gap-2 border-b border-lt-border px-3 text-sm font-semibold">
        {type?.icon && <Icon name={type.icon} className="size-lt-icon-md text-lt-muted-fg" />}
        <span data-test="blocks-inspector-title">
          {type?.label ?? t("blocks.editor.inspector.title", "Block")}
        </span>
        {entry && (
          <span className="ml-auto font-mono text-[10px] font-normal text-lt-muted-fg">
            {entry.node.type}
          </span>
        )}
      </div>
      {entry ? (
        <>
          <div role="tablist" className="flex border-b border-lt-border px-2">
            {tabs
              .filter((candidate) => !candidate.hidden)
              .map((candidate) => (
                <button
                  key={candidate.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === candidate.key}
                  data-test={`blocks-inspector-tab-${candidate.key}`}
                  className={cn(
                    "-mb-px border-b-2 px-2.5 py-2 text-xs font-medium",
                    activeTab === candidate.key
                      ? "border-lt-fg text-lt-fg"
                      : "border-transparent text-lt-muted-fg hover:text-lt-fg",
                  )}
                  onClick={() => setTab(candidate.key)}
                >
                  {candidate.label}
                </button>
              ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto" role="tabpanel">
            {activeTab === "style" && type && (
              <StylePanel id={entry.node.id} style={entry.node.style} supports={type.supports} />
            )}
            {activeTab === "content" && type && (
              <ContentPanel
                key={`${entry.node.id}:${travelCount}`}
                id={entry.node.id}
                type={type}
                data={entry.node.data}
              />
            )}
            {activeTab === "advanced" && type && (
              <AdvancedPanel id={entry.node.id} style={entry.node.style} supports={type.supports} />
            )}
            {activeTab === "structure" && <StructurePanel />}
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <p
            className="border-b border-lt-border px-3 py-3 text-sm text-lt-muted-fg"
            data-test="blocks-inspector-empty"
          >
            {t("blocks.editor.inspector.none", "Select a block to edit its settings.")}
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <StructurePanel />
          </div>
        </div>
      )}
    </aside>
  );
}

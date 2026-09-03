import { useRef } from "react";
import { Button } from "@lattice-php/ui/components/button/button";
import { SegmentedControl } from "@lattice-php/ui/components/segmented-control/segmented-control";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { NativeSelect } from "@lattice-php/ui/primitives/native-select";
import { Input } from "@lattice-php/form/primitives/input";
import type { ViewMode } from "./media-row";

/** `key:direction`, or an empty string for the definition's own order. */
export type SortChoice = string;

export function sortsFor(choice: SortChoice): { direction: "asc" | "desc"; key: string }[] {
  const [key, direction] = choice.split(":");

  if (key === undefined || key === "" || direction === undefined) {
    return [];
  }

  return [{ direction: direction === "desc" ? "desc" : "asc", key }];
}

export function LibraryToolbar({
  accept,
  defaultSearch,
  onFiles,
  onSearch,
  onSortChange,
  onTypeChange,
  onViewChange,
  sort,
  sortableKeys,
  uploadLabel,
  view,
}: {
  accept: string | null;
  defaultSearch: string;
  onFiles: ((files: FileList | null) => void) | null;
  onSearch: (term: string) => void;
  onSortChange: (choice: SortChoice) => void;
  onTypeChange: (type: string) => void;
  onViewChange: ((view: ViewMode) => void) | null;
  sort: SortChoice;
  sortableKeys: string[];
  uploadLabel: string;
  view: ViewMode;
}) {
  const { t } = useT("media");
  const fileInput = useRef<HTMLInputElement>(null);
  const sortChoices = [
    { key: "name", label: t("media.sort.name-asc", "Name A–Z"), value: "name:asc" },
    { key: "name", label: t("media.sort.name-desc", "Name Z–A"), value: "name:desc" },
    { key: "size", label: t("media.sort.size-desc", "Largest first"), value: "size:desc" },
    { key: "size", label: t("media.sort.size-asc", "Smallest first"), value: "size:asc" },
    {
      key: "created_at",
      label: t("media.sort.oldest", "Oldest first"),
      value: "created_at:asc",
    },
  ].filter((choice) => sortableKeys.includes(choice.key));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        className="max-w-xs"
        data-test="media-search"
        defaultValue={defaultSearch}
        onChange={(event) => onSearch(event.target.value)}
        placeholder={t("media.library.search", "Search media")}
        type="search"
      />
      <NativeSelect
        aria-label={t("media.filters.type.label", "Type")}
        className="max-w-40"
        data-test="media-type-filter"
        defaultValue=""
        onChange={(event) => onTypeChange(event.target.value)}
      >
        <option value="">{t("media.filters.type.all", "All types")}</option>
        <option value="image">{t("media.filters.type.image", "Images")}</option>
        <option value="video">{t("media.filters.type.video", "Video")}</option>
        <option value="audio">{t("media.filters.type.audio", "Audio")}</option>
        <option value="document">{t("media.filters.type.document", "Documents")}</option>
      </NativeSelect>
      {sortChoices.length > 0 && (
        <NativeSelect
          aria-label={t("media.sort.label", "Sort by")}
          className="max-w-44"
          data-test="media-sort"
          onChange={(event) => onSortChange(event.target.value)}
          value={sort}
        >
          <option value="">{t("media.sort.newest", "Newest first")}</option>
          {sortChoices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </NativeSelect>
      )}
      {onViewChange && (
        <SegmentedControl
          aria-label={t("media.view.label", "View")}
          data-test="media-view"
          onValueChange={(value) => onViewChange(value === "list" ? "list" : "grid")}
          options={[
            {
              label: (
                <span className="flex items-center gap-1.5">
                  <Icon className="size-lt-icon-sm" name="layout-grid" />
                  {t("media.view.grid", "Grid")}
                </span>
              ),
              value: "grid",
            },
            {
              label: (
                <span className="flex items-center gap-1.5">
                  <Icon className="size-lt-icon-sm" name="list" />
                  {t("media.view.list", "List")}
                </span>
              ),
              value: "list",
            },
          ]}
          value={view}
        />
      )}
      {onFiles && (
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
            accept={accept ?? undefined}
            aria-label={uploadLabel}
            className="sr-only"
            data-test="media-upload-input"
            multiple
            onChange={(event) => {
              onFiles(event.target.files);
              event.target.value = "";
            }}
            ref={fileInput}
            type="file"
          />
        </>
      )}
    </div>
  );
}

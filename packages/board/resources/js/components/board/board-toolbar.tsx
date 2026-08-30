import { FilterBar, FilterMenu, TableSearch } from "@lattice-php/table";
import type { FilterIndicator, FilterNode } from "@lattice-php/table";
import type { Option } from "@lattice-php/core";

export type BoardToolbarProps = {
  filters: FilterNode[];
  indicators: FilterIndicator[];
  onReset: () => void;
  onSearch: (term: string) => void;
  onSearchFilterOptions: (
    searchKey: string,
    query: string,
    signal?: AbortSignal,
  ) => Promise<Option[]>;
  onTableFilter: (key: string, value: unknown) => void;
  search: string;
  searchable: boolean;
  tableFilters: Record<string, unknown>;
};

export function BoardToolbar({
  filters,
  indicators,
  onReset,
  onSearch,
  onSearchFilterOptions,
  onTableFilter,
  search,
  searchable,
  tableFilters,
}: BoardToolbarProps) {
  if (!searchable && filters.length === 0) {
    return null;
  }

  return (
    <div className="lt-board-toolbar" data-test="board-toolbar">
      <div className="flex items-center gap-2">
        {searchable && <TableSearch value={search} onSearch={onSearch} />}
        <div className="ms-auto flex items-center gap-1">
          {filters.length > 0 && (
            <FilterMenu
              filters={filters}
              values={tableFilters}
              processing={false}
              onChange={onTableFilter}
              onSearch={onSearchFilterOptions}
            />
          )}
        </div>
      </div>
      <FilterBar
        clauses={[]}
        columnsByKey={new Map()}
        indicators={indicators}
        processing={false}
        onRemoveClause={() => {}}
        onChange={onTableFilter}
        onReset={onReset}
      />
    </div>
  );
}

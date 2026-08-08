import { vi } from "vitest";
import type { Node } from "@lattice-php/core/types";
import type { ColumnFilter } from "./generated";
import type { TableColumn, TableNode, TablePagination, TableQuery, TableResult } from "./types";

export function col(partial: {
  key: string;
  label: string;
  type?: string;
  width?: TableColumn["props"]["width"];
  sortable?: boolean;
  filter?: ColumnFilter | null;
  schema?: Node[];
  props?: Record<string, unknown>;
}): TableColumn {
  const { key, label, type = "column.text", width, sortable, filter, schema, props } = partial;

  return {
    key,
    type,
    props: {
      label,
      width: width ?? (type === "column.stack" ? "xl" : "md"),
      align: "start",
      sortable: sortable ?? null,
      toggleable: false,
      hiddenByDefault: false,
      filter: filter ?? null,
      ...props,
    },
    ...(schema ? { schema } : {}),
  } as TableColumn;
}

export function pagination(overrides: Partial<TablePagination> = {}): TablePagination {
  return {
    mode: "none",
    currentPage: null,
    lastPage: null,
    perPage: null,
    total: null,
    from: null,
    to: null,
    hasMore: false,
    nextPage: null,
    ...overrides,
  };
}

export function tableQuery(overrides: Partial<TableQuery> = {}): TableQuery {
  return {
    filters: [],
    mode: null,
    page: 1,
    perPage: 25,
    search: "",
    sorts: [],
    tableFilterIndicators: [],
    tableFilters: {},
    ...overrides,
  };
}

export function tableNode(overrides: Partial<TableNode["props"]> = {}): TableNode {
  return {
    id: "workbench.products",
    type: "table",
    props: {
      columns: [],
      data: [],
      endpoint: "/lattice/tables/workbench.products",
      query: tableQuery(),
      ...overrides,
    },
  };
}

export type TableResultOverrides = Partial<Omit<TableResult, "query">> & {
  query?: Partial<TableQuery>;
};

function tableResponse(overrides: TableResultOverrides = {}): Response {
  return Response.json({
    data: [],
    pagination: {},
    ...overrides,
    query: tableQuery(overrides.query),
  });
}

export function tableFetch(...responses: TableResultOverrides[]) {
  let calls = 0;
  const fetch = vi.fn<typeof globalThis.fetch>(async () => {
    const response = responses[Math.min(calls, responses.length - 1)] ?? {};
    calls += 1;

    return tableResponse(response);
  });

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

export function searchFetch(options: Array<{ label: string; value: string }>) {
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) =>
    String(input).includes("_sub=search") ? Response.json({ options }) : tableResponse(),
  );

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

export function requestOptions(headers: Record<string, string> = {}) {
  return {
    credentials: "same-origin",
    method: undefined,
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      ...headers,
    },
  };
}

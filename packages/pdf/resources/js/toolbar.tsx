import { useEffect, useState } from "react";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";

const iconButtonClass =
  "rounded-lt-sm p-1.5 hover:bg-lt-muted disabled:pointer-events-none disabled:opacity-40";

export type ToolbarProps = {
  sidebarToggle: boolean;
  sidebarOpen: boolean;
  onToggleSidebar(): void;
  currentPage: number;
  totalPages: number;
  onJump(page: number): void;
  zoomPercent: number | null;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn(): void;
  onZoomOut(): void;
  onFitWidth(): void;
  searchable: boolean;
  query: string;
  onQueryChange(query: string): void;
  matchCount: number;
  currentMatch: number;
  onNextMatch(): void;
  onPreviousMatch(): void;
  downloadable: boolean;
  url: string;
  filename: string | null;
};

export function Toolbar(props: ToolbarProps): React.ReactElement {
  const { t } = useT("pdf");
  const [pageInput, setPageInput] = useState(String(props.currentPage));
  // Blurring must only jump for values the user actually typed — the input
  // also tracks the visible page while scrolling, and a blur mid-scroll would
  // otherwise fire a jump to a transient page number.
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setPageInput(String(props.currentPage));
    setDirty(false);
  }, [props.currentPage]);

  function jumpTo(raw: string): void {
    setDirty(false);
    const page = Number.parseInt(raw, 10);

    if (Number.isNaN(page)) {
      setPageInput(String(props.currentPage));

      return;
    }

    const clamped = Math.min(props.totalPages, Math.max(1, page));
    setPageInput(String(clamped));
    props.onJump(clamped);
  }

  return (
    <div className="lt-pdf-toolbar flex flex-wrap items-center gap-1 border-b border-lt-border p-2">
      {props.sidebarToggle ? (
        <button
          aria-label={t("pdf.sidebar.toggle", "Toggle sidebar")}
          aria-pressed={props.sidebarOpen}
          className={iconButtonClass}
          onClick={props.onToggleSidebar}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="panel-left" />
        </button>
      ) : null}
      <input
        aria-label={t("pdf.page.jump", "Go to page")}
        className="h-7 w-12 rounded-lt-sm border border-lt-border bg-transparent text-center text-sm"
        inputMode="numeric"
        onBlur={(event) => {
          if (dirty) {
            jumpTo(event.target.value);
          }
        }}
        onChange={(event) => {
          setDirty(true);
          setPageInput(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            jumpTo(event.currentTarget.value);
          }
        }}
        value={pageInput}
      />
      <span className="text-sm text-lt-muted-fg" data-test="pdf-page-indicator">
        {t("pdf.page.of", "of {{total}}", { total: props.totalPages })}
      </span>

      <div className="ml-2 flex items-center gap-1">
        <button
          aria-label={t("pdf.zoom.out", "Zoom out")}
          className={iconButtonClass}
          disabled={!props.canZoomOut}
          onClick={props.onZoomOut}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="minus" />
        </button>
        <span className="min-w-12 text-center text-sm tabular-nums" data-test="pdf-zoom-level">
          {props.zoomPercent === null ? "—" : `${props.zoomPercent}%`}
        </span>
        <button
          aria-label={t("pdf.zoom.in", "Zoom in")}
          className={iconButtonClass}
          disabled={!props.canZoomIn}
          onClick={props.onZoomIn}
          type="button"
        >
          <Icon className="size-lt-icon-sm" name="plus" />
        </button>
        <button
          className="rounded-lt-sm px-2 py-1 text-sm hover:bg-lt-muted"
          onClick={props.onFitWidth}
          type="button"
        >
          {t("pdf.zoom.fit-width", "Fit width")}
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {props.searchable ? (
          <>
            <div className="flex h-7 items-center gap-1 rounded-lt-sm border border-lt-border px-2">
              <Icon aria-hidden="true" className="size-lt-icon-sm text-lt-muted-fg" name="search" />
              <input
                aria-label={t("pdf.search.placeholder", "Search document…")}
                className="w-36 bg-transparent text-sm outline-none placeholder:text-lt-muted-fg"
                onChange={(event) => props.onQueryChange(event.target.value)}
                placeholder={t("pdf.search.placeholder", "Search document…")}
                type="search"
                value={props.query}
              />
            </div>
            {props.query.trim() !== "" ? (
              <span
                aria-live="polite"
                className="text-sm text-lt-muted-fg tabular-nums"
                data-test="pdf-match-count"
              >
                {props.matchCount === 0
                  ? t("pdf.search.no-matches", "No matches")
                  : t("pdf.search.matches", "{{current}} of {{total}}", {
                      current: props.currentMatch,
                      total: props.matchCount,
                    })}
              </span>
            ) : null}
            <button
              aria-label={t("pdf.search.previous", "Previous match")}
              className={iconButtonClass}
              disabled={props.matchCount === 0}
              onClick={props.onPreviousMatch}
              type="button"
            >
              <Icon className="size-lt-icon-sm" name="chevron-left" />
            </button>
            <button
              aria-label={t("pdf.search.next", "Next match")}
              className={iconButtonClass}
              disabled={props.matchCount === 0}
              onClick={props.onNextMatch}
              type="button"
            >
              <Icon className="size-lt-icon-sm" name="chevron-right" />
            </button>
          </>
        ) : null}

        {props.downloadable ? (
          <a
            aria-label={t("pdf.download", "Download")}
            className={iconButtonClass}
            download={props.filename ?? ""}
            href={props.url}
          >
            <Icon className="size-lt-icon-sm" name="download" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

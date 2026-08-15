import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GlobalWorkerOptions } from "pdfjs-dist";
import { useT } from "@lattice-php/ui/i18n";
import type { PdfEngineProps } from "./engine-registry";
import { PageList } from "./page-list";
import type { PageListHandle } from "./page-list";
import { Toolbar } from "./toolbar";
import { createPageTextCache } from "./text-cache";
import { usePdfDocument } from "./use-pdf-document";
import { useSearch } from "./use-search";
import { useZoom } from "./use-zoom";

const PdfEngine = ({ node }: PdfEngineProps): React.ReactElement => {
  const { t } = useT("pdf");
  const props = node.props;

  // One Laravel app produces one worker URL, so last-wins is acceptable for
  // this process-global option.
  if (GlobalWorkerOptions.workerSrc !== props.workerUrl) {
    GlobalWorkerOptions.workerSrc = props.workerUrl;
  }

  const { doc, error } = usePdfDocument({
    url: props.url,
    cmapUrl: props.cmapUrl,
    standardFontDataUrl: props.standardFontDataUrl,
    wasmUrl: props.wasmUrl,
  });
  const textCache = useMemo(() => (doc ? createPageTextCache(doc) : null), [doc]);
  const [baseSize, setBaseSize] = useState<{ width: number; height: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageListRef = useRef<PageListHandle>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const zoom = useZoom({
    containerRef: scrollRef,
    baseWidth: baseSize?.width ?? null,
    initialZoom: props.initialZoom,
  });
  const search = useSearch(props.searchable ? textCache : null);

  useEffect(() => {
    if (!doc) {
      setBaseSize(null);
      setCurrentPage(1);

      return;
    }

    let cancelled = false;

    doc
      .getPage(1)
      .then((page) => {
        if (!cancelled) {
          const viewport = page.getViewport({ scale: 1 });
          setBaseSize({ width: viewport.width, height: viewport.height });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("[lattice/pdf] measuring the first page failed", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [doc]);

  const currentMatch = search.currentMatch;

  useEffect(() => {
    if (currentMatch) {
      pageListRef.current?.scrollToPage(currentMatch.page);
    }
  }, [currentMatch]);

  const onVisiblePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (error) {
    return (
      <div className="lt-pdf-status" role="alert">
        {t("pdf.error", "The document could not be loaded.")}
      </div>
    );
  }

  return (
    <div className="lt-pdf-engine">
      <Toolbar
        canZoomIn={zoom.canZoomIn}
        canZoomOut={zoom.canZoomOut}
        currentMatch={search.currentIndex + 1}
        currentPage={currentPage}
        downloadable={props.downloadable}
        filename={props.filename}
        matchCount={search.matches.length}
        onFitWidth={zoom.fitWidth}
        onJump={(page) => pageListRef.current?.scrollToPage(page)}
        onNextMatch={search.next}
        onPreviousMatch={search.previous}
        onQueryChange={search.setQuery}
        onZoomIn={zoom.zoomIn}
        onZoomOut={zoom.zoomOut}
        query={search.query}
        searchable={props.searchable}
        totalPages={doc?.numPages ?? 0}
        url={props.url}
        zoomPercent={zoom.percent}
      />
      <div className="lt-pdf-scroll" ref={scrollRef}>
        {doc && textCache && baseSize && zoom.scale !== null ? (
          <PageList
            baseSize={baseSize}
            doc={doc}
            scrollRootRef={scrollRef}
            onVisiblePageChange={onVisiblePageChange}
            ref={pageListRef}
            scale={zoom.scale}
            search={search}
            textCache={textCache}
          />
        ) : (
          <div className="lt-pdf-status">
            <span role="status">{t("pdf.loading", "Loading document…")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfEngine;

import { useEffect, useRef, useState } from "react";
import { RenderingCancelledException, TextLayer } from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { useT } from "@lattice-php/ui/i18n";
import {
  clearHighlightRanges,
  setHighlightRanges,
  supportsHighlightApi,
} from "./highlight-registry";
import { resolveLinkOverlays } from "./link-annotations";
import type { LinkOverlay } from "./link-annotations";
import { applyHighlights, matchRanges } from "./search";
import type { SearchMatch } from "./search";
import type { PageTextCache } from "./text-cache";
import { usePdfPageLayerRegistry } from "./page-layer-registry";
import type { PdfPageViewport } from "./page-layer-registry";

type PdfPageProps = {
  doc: PDFDocumentProxy;
  layers: string[];
  pageNumber: number;
  scale: number;
  textCache: PageTextCache;
  matches: SearchMatch[];
  currentStart: number | null;
  onNavigateToPage(page: number): void;
};

function warnUnlessCancelled(error: unknown, context: string): void {
  if (!(error instanceof RenderingCancelledException)) {
    console.error(`[lattice/pdf] ${context}`, error);
  }
}

export function PdfPage({
  doc,
  layers,
  pageNumber,
  scale,
  textCache,
  matches,
  currentStart,
  onNavigateToPage,
}: PdfPageProps): React.ReactElement {
  const { t } = useT("pdf");
  const layerRegistry = usePdfPageLayerRegistry();
  const [rendered, setRendered] = useState<{
    page: PDFPageProxy;
    viewport: PdfPageViewport;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<TextLayer | null>(null);
  const ownerRef = useRef<Record<never, never>>({});
  const [layerVersion, setLayerVersion] = useState(0);
  const [links, setLinks] = useState<LinkOverlay[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const page = await doc.getPage(pageNumber);
      const overlays = await resolveLinkOverlays(doc, page, page.getViewport({ scale }));

      if (!cancelled) {
        setLinks(overlays);
      }
    })().catch((error: unknown) => {
      if (!cancelled) {
        warnUnlessCancelled(error, `link annotations for page ${pageNumber} failed`);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber, scale]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const textContainer = textLayerRef.current;

    if (!root || !canvas || !textContainer) {
      return;
    }

    let cancelled = false;
    let cancelRender: (() => void) | null = null;

    void (async () => {
      const page = await doc.getPage(pageNumber);

      if (cancelled) {
        return;
      }

      const viewport = page.getViewport({ scale });
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      root.style.setProperty("--scale-factor", String(viewport.scale));
      setRendered({
        page,
        viewport: {
          scale: viewport.scale,
          rotation: viewport.rotation,
          width: viewport.width,
          height: viewport.height,
        },
      });

      const renderTask = page.render({
        canvas,
        viewport,
        transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
      });
      let textLayer: TextLayer | null = null;
      cancelRender = () => {
        renderTask.cancel();
        textLayer?.cancel();
      };

      renderTask.promise.catch((error: unknown) =>
        warnUnlessCancelled(error, `rendering page ${pageNumber} failed`),
      );

      // The text layer must never take the canvas down with it — a document
      // whose text extraction fails still renders, it just loses selection
      // and search on that page.
      try {
        const { content } = await textCache.get(pageNumber);

        if (cancelled) {
          return;
        }

        textContainer.textContent = "";
        textLayer = new TextLayer({
          textContentSource: content,
          container: textContainer,
          viewport,
        });
        await textLayer.render();

        if (!cancelled) {
          layerRef.current = textLayer;
          setLayerVersion((version) => version + 1);
        }
      } catch (error) {
        if (!cancelled) {
          warnUnlessCancelled(error, `text layer for page ${pageNumber} failed`);
        }
      }
    })().catch((error: unknown) => {
      if (!cancelled) {
        warnUnlessCancelled(error, `loading page ${pageNumber} failed`);
      }
    });

    return () => {
      cancelled = true;
      layerRef.current = null;
      cancelRender?.();
    };
  }, [doc, pageNumber, scale, textCache]);

  useEffect(() => {
    const layer = layerRef.current;

    if (!layer) {
      return;
    }

    const highlightInput = {
      textDivs: layer.textDivs,
      items: layer.textContentItemsStr,
      matches,
      currentStart,
    };
    let currentRect: DOMRect | undefined;

    if (supportsHighlightApi()) {
      const ranges = matchRanges(highlightInput);
      setHighlightRanges(ownerRef.current, ranges);
      currentRect = ranges.current[0]?.getBoundingClientRect();
    } else {
      applyHighlights(highlightInput);
      currentRect = rootRef.current
        ?.querySelector("mark.lt-pdf-match--current")
        ?.getBoundingClientRect();
    }

    if (currentStart !== null && currentRect) {
      // Scroll only the viewer's own container — scrollIntoView would also
      // scroll the window and push the toolbar out of view.
      const container = rootRef.current?.closest(".lt-pdf-scroll");

      if (container) {
        const targetTop =
          currentRect.top - container.getBoundingClientRect().top + container.scrollTop;
        container.scrollTo({ top: Math.max(0, targetTop - container.clientHeight / 2) });
      }
    }
  }, [matches, currentStart, layerVersion]);

  useEffect(() => {
    const owner = ownerRef.current;

    return () => {
      clearHighlightRanges(owner);
    };
  }, []);

  return (
    <div className="lt-pdf-page" data-test="pdf-page" ref={rootRef}>
      <canvas ref={canvasRef} />
      <div className="lt-pdf-textlayer" ref={textLayerRef} />
      {links.length > 0 ? (
        <div className="lt-pdf-linklayer">
          {links.map((link) => {
            const style = {
              left: link.left,
              top: link.top,
              width: link.width,
              height: link.height,
            };

            return link.url !== null ? (
              <a
                aria-label={t("pdf.link.external", "Open {{url}}", { url: link.url })}
                className="lt-pdf-link"
                href={link.url}
                key={link.id}
                rel="noopener noreferrer"
                style={style}
                target="_blank"
              />
            ) : (
              <a
                aria-label={t("pdf.link.page", "Go to page {{page}}", { page: link.page })}
                className="lt-pdf-link"
                href={`#pdf-page-${link.page}`}
                key={link.id}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigateToPage(link.page!);
                }}
                style={style}
              />
            );
          })}
        </div>
      ) : null}
      {rendered && layers.length > 0 ? (
        <div className="lt-pdf-layers" data-test="pdf-page-layers">
          {layers.map((key) => {
            const Layer = layerRegistry[key];

            return Layer ? (
              <Layer
                doc={doc}
                key={key}
                page={rendered.page}
                pageNumber={pageNumber}
                viewport={rendered.viewport}
              />
            ) : null;
          })}
        </div>
      ) : null}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { RenderingCancelledException, TextLayer } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { applyHighlights } from "./search";
import type { SearchMatch } from "./search";
import type { PageTextCache } from "./text-cache";

type PdfPageProps = {
  doc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  textCache: PageTextCache;
  matches: SearchMatch[];
  currentStart: number | null;
};

function warnUnlessCancelled(error: unknown, context: string): void {
  if (!(error instanceof RenderingCancelledException)) {
    console.error(`[lattice/pdf] ${context}`, error);
  }
}

export function PdfPage({
  doc,
  pageNumber,
  scale,
  textCache,
  matches,
  currentStart,
}: PdfPageProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<TextLayer | null>(null);
  const [layerVersion, setLayerVersion] = useState(0);

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

    applyHighlights({
      textDivs: layer.textDivs,
      items: layer.textContentItemsStr,
      matches,
      currentStart,
    });

    if (currentStart !== null) {
      const mark = rootRef.current?.querySelector("mark.lt-pdf-match--current");
      // Scroll only the viewer's own container — scrollIntoView would also
      // scroll the window and push the toolbar out of view.
      const container = rootRef.current?.closest(".lt-pdf-scroll");

      if (mark && container) {
        const markTop =
          mark.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop;
        container.scrollTo({ top: Math.max(0, markTop - container.clientHeight / 2) });
      }
    }
  }, [matches, currentStart, layerVersion]);

  return (
    <div className="lt-pdf-page" data-test="pdf-page" ref={rootRef}>
      <canvas ref={canvasRef} />
      <div className="lt-pdf-textlayer" ref={textLayerRef} />
    </div>
  );
}

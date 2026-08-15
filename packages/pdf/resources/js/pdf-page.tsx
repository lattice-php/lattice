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
      try {
        const page = await doc.getPage(pageNumber);
        const { content } = await textCache.get(pageNumber);

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
        textContainer.textContent = "";
        const textLayer = new TextLayer({
          textContentSource: content,
          container: textContainer,
          viewport,
        });
        cancelRender = () => {
          renderTask.cancel();
          textLayer.cancel();
        };

        await Promise.all([renderTask.promise, textLayer.render()]);

        if (!cancelled) {
          layerRef.current = textLayer;
          setLayerVersion((version) => version + 1);
        }
      } catch (error) {
        if (!(error instanceof RenderingCancelledException)) {
          throw error;
        }
      }
    })();

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
      rootRef.current
        ?.querySelector("mark.lt-pdf-match--current")
        ?.scrollIntoView({ block: "center" });
    }
  }, [matches, currentStart, layerVersion]);

  return (
    <div className="lt-pdf-page" data-test="pdf-page" ref={rootRef}>
      <canvas ref={canvasRef} />
      <div className="lt-pdf-textlayer" ref={textLayerRef} />
    </div>
  );
}

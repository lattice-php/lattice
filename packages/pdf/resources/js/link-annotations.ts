import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";

export type LinkOverlay = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  url: string | null;
  page: number | null;
};

type LinkAnnotation = {
  id: string;
  subtype: string;
  rect: [number, number, number, number];
  url?: string;
  dest?: unknown;
};

async function destinationPage(doc: PDFDocumentProxy, dest: unknown): Promise<number | null> {
  const resolved = typeof dest === "string" ? await doc.getDestination(dest) : dest;

  if (!Array.isArray(resolved) || resolved.length === 0) {
    return null;
  }

  const target: unknown = resolved[0];

  if (typeof target === "number") {
    return target + 1;
  }

  if (typeof target === "object" && target !== null && "num" in target) {
    return (await doc.getPageIndex(target as Parameters<PDFDocumentProxy["getPageIndex"]>[0])) + 1;
  }

  return null;
}

function overlayBox(
  viewport: PageViewport,
  rect: [number, number, number, number],
): Pick<LinkOverlay, "left" | "top" | "width" | "height"> {
  const [x1, y1] = viewport.convertToViewportPoint(rect[0], rect[1]) as [number, number];
  const [x2, y2] = viewport.convertToViewportPoint(rect[2], rect[3]) as [number, number];

  return {
    left: Math.min(x1, x2),
    top: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export async function resolveLinkOverlays(
  doc: PDFDocumentProxy,
  page: PDFPageProxy,
  viewport: PageViewport,
): Promise<LinkOverlay[]> {
  const annotations = (await page.getAnnotations()) as LinkAnnotation[];
  const overlays: LinkOverlay[] = [];

  for (const annotation of annotations) {
    if (annotation.subtype !== "Link") {
      continue;
    }

    const url = typeof annotation.url === "string" && annotation.url !== "" ? annotation.url : null;
    const targetPage = url === null ? await destinationPage(doc, annotation.dest) : null;

    if (url === null && targetPage === null) {
      continue;
    }

    overlays.push({
      id: annotation.id,
      ...overlayBox(viewport, annotation.rect),
      url,
      page: targetPage,
    });
  }

  return overlays;
}

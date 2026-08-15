import type { PDFDocumentProxy } from "pdfjs-dist";
import type { TextContent } from "pdfjs-dist/types/src/display/api";

export type PageText = {
  content: TextContent;
  items: string[];
};

export type PageTextCache = {
  numPages: number;
  get(page: number): Promise<PageText>;
};

export function createPageTextCache(doc: PDFDocumentProxy): PageTextCache {
  const cache = new Map<number, Promise<PageText>>();

  return {
    numPages: doc.numPages,
    get(page: number): Promise<PageText> {
      let entry = cache.get(page);

      if (!entry) {
        entry = doc.getPage(page).then(async (pageProxy) => {
          const content = await pageProxy.getTextContent();
          const items = content.items.map((item) => ("str" in item ? item.str : ""));

          return { content, items };
        });
        cache.set(page, entry);
      }

      return entry;
    },
  };
}

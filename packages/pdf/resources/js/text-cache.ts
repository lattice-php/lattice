import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import type { TextContent } from "pdfjs-dist/types/src/display/api";

export type PageText = {
  content: TextContent;
  items: string[];
};

export type PageTextCache = {
  numPages: number;
  get(page: number): Promise<PageText>;
};

/**
 * pdf.js's own getTextContent() drives its stream with `for await`, which
 * Safari cannot iterate (ReadableStream has no async iterator there) — read
 * the stream with a plain reader instead.
 */
async function readTextContent(page: PDFPageProxy): Promise<TextContent> {
  const reader = page.streamTextContent().getReader() as ReadableStreamDefaultReader<TextContent>;
  const content: TextContent = { items: [], styles: {}, lang: null };

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      return content;
    }

    content.lang ??= value.lang;
    Object.assign(content.styles, value.styles);
    content.items.push(...value.items);
  }
}

export function createPageTextCache(doc: PDFDocumentProxy): PageTextCache {
  const cache = new Map<number, Promise<PageText>>();

  return {
    numPages: doc.numPages,
    get(page: number): Promise<PageText> {
      let entry = cache.get(page);

      if (!entry) {
        entry = doc.getPage(page).then(async (pageProxy) => {
          const content = await readTextContent(pageProxy);
          const items = content.items.map((item) => ("str" in item ? item.str : ""));

          return { content, items };
        });
        entry.catch(() => cache.delete(page));
        cache.set(page, entry);
      }

      return entry;
    },
  };
}

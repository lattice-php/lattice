import { describe, expect, it } from "vitest";
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";
import { resolveLinkOverlays } from "./link-annotations";

type FakeAnnotation = {
  id: string;
  subtype: string;
  rect: [number, number, number, number];
  url?: string;
  dest?: unknown;
};

function fakeDoc(): PDFDocumentProxy {
  return {
    getDestination: (id: string) =>
      Promise.resolve(id === "chapter-2" ? [{ num: 7, gen: 0 }, { name: "Fit" }] : null),
    getPageIndex: (ref: { num: number }) => Promise.resolve(ref.num === 7 ? 3 : 0),
  } as unknown as PDFDocumentProxy;
}

function fakePage(annotations: FakeAnnotation[]): PDFPageProxy {
  return { getAnnotations: () => Promise.resolve(annotations) } as unknown as PDFPageProxy;
}

const doubleScaleViewport = {
  convertToViewportPoint: (x: number, y: number) => [x * 2, 800 - y * 2],
} as unknown as PageViewport;

describe("resolveLinkOverlays", () => {
  it("normalizes pdf rects into viewport boxes and keeps only link annotations", async () => {
    const overlays = await resolveLinkOverlays(
      fakeDoc(),
      fakePage([
        { id: "a", subtype: "Link", rect: [10, 20, 60, 35], url: "https://example.test/" },
        { id: "b", subtype: "Text", rect: [0, 0, 10, 10] },
        { id: "c", subtype: "Link", rect: [0, 0, 10, 10] },
      ]),
      doubleScaleViewport,
    );

    expect(overlays).toEqual([
      {
        id: "a",
        left: 20,
        top: 730,
        width: 100,
        height: 30,
        url: "https://example.test/",
        page: null,
      },
    ]);
  });

  it("resolves explicit ref destinations to a 1-based page number", async () => {
    const overlays = await resolveLinkOverlays(
      fakeDoc(),
      fakePage([
        {
          id: "goto",
          subtype: "Link",
          rect: [0, 0, 10, 10],
          dest: [{ num: 7, gen: 0 }, { name: "Fit" }],
        },
      ]),
      doubleScaleViewport,
    );

    expect(overlays[0]).toMatchObject({ url: null, page: 4 });
  });

  it("resolves named destinations through the document", async () => {
    const overlays = await resolveLinkOverlays(
      fakeDoc(),
      fakePage([{ id: "named", subtype: "Link", rect: [0, 0, 10, 10], dest: "chapter-2" }]),
      doubleScaleViewport,
    );

    expect(overlays[0]).toMatchObject({ url: null, page: 4 });
  });

  it("treats a plain page-number destination as an index", async () => {
    const overlays = await resolveLinkOverlays(
      fakeDoc(),
      fakePage([
        { id: "index", subtype: "Link", rect: [0, 0, 10, 10], dest: [2, { name: "Fit" }] },
      ]),
      doubleScaleViewport,
    );

    expect(overlays[0]).toMatchObject({ url: null, page: 3 });
  });
});

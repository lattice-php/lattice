import { page, userEvent } from "vitest/browser";
import { expect, it } from "vitest";
import { createRegistry, Renderer } from "@lattice-php/core";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode } from "@lattice-php/core/test-support";
import type { Plugin } from "@lattice-php/core";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import pdfUrl from "./fixtures/sample.pdf?url";
import pdfPlugin from "./plugin";
import composerPlugin from "./plugin.composer";
import distPlugin from "../../dist/plugin.js";
import type { PdfViewer } from "./types";
import "../css/pdf.css";

const registry = createRegistry(pdfPlugin, { name: "test/pdf-content" });
const composerRegistry = createRegistry(composerPlugin, { name: "test/pdf-content" });
const distRegistry = createRegistry(distPlugin as Plugin, { name: "test/pdf-content" });

async function renderViewer(extra: Partial<PdfViewer> = {}, into = registry) {
  const node = fakeNode({
    id: "manual",
    type: "pdf",
    props: {
      url: pdfUrl,
      workerUrl,
      filename: "sample.pdf",
      downloadable: true,
      searchable: true,
      height: 480,
      maxHeight: null,
      initialZoom: null,
      cmapUrl: null,
      standardFontDataUrl: null,
      wasmUrl: null,
      ...extra,
    },
  });

  return renderWithRegistry(<Renderer nodes={[node]} />, into);
}

function renderedCanvas(): HTMLCanvasElement | null {
  return document.querySelector<HTMLCanvasElement>('[data-test="pdf-page"] canvas');
}

function canvasInk(): number {
  const canvas = renderedCanvas();

  if (!canvas || canvas.width === 0) {
    return 0;
  }

  const { data } = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
  let ink = 0;

  for (let offset = 0; offset < data.length; offset += 64) {
    if (data[offset + 3]! > 0 && data[offset]! < 200) {
      ink += 1;
    }
  }

  return ink;
}

it("renders the document onto a canvas with a page indicator", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0).toBe(true);
  await expect.poll(() => canvasInk()).toBeGreaterThan(50);
  await expect.element(page.getByTestId("pdf-page-indicator")).toHaveTextContent("of 2");
  await expect
    .element(page.getByText("The quick brown fox jumps over the lazy dog."))
    .toBeInTheDocument();
});

it("draws actual page pixels at a retina devicePixelRatio", async () => {
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 2 });

  try {
    await renderViewer({ initialZoom: 1 });

    await expect.poll(() => renderedCanvas()?.width ?? 0).toBe(1224);
    await expect.poll(() => renderedCanvas()?.style.width ?? "").toBe("612px");
    await expect.poll(() => canvasInk()).toBeGreaterThan(50);
  } finally {
    delete (window as { devicePixelRatio?: number }).devicePixelRatio;
  }
});

it("zooms the rendered page and returns to fit width", async () => {
  await renderViewer({ initialZoom: 1 });

  await expect
    .poll(() => Number.parseFloat(renderedCanvas()?.style.width ?? ""))
    .toBeGreaterThan(0);
  const initialWidth = Number.parseFloat(renderedCanvas()!.style.width);
  await expect.element(page.getByTestId("pdf-zoom-level")).toHaveTextContent("100%");

  await userEvent.click(page.getByRole("button", { name: "Zoom in" }));

  await expect.element(page.getByTestId("pdf-zoom-level")).toHaveTextContent("125%");
  await expect
    .poll(() => Number.parseFloat(renderedCanvas()?.style.width ?? "0"))
    .toBeGreaterThan(initialWidth);

  await userEvent.click(page.getByRole("button", { name: "Fit width" }));

  await expect
    .poll(() => Number.parseFloat(renderedCanvas()?.style.width ?? "0"))
    .toBeGreaterThan(initialWidth * 1.3);
});

it("navigates pages through the jump input", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0).toBe(true);

  const input = page.getByLabelText("Go to page");
  await userEvent.fill(input, "2");
  await userEvent.keyboard("{Enter}");

  await expect.element(page.getByText("Another quick line on page two.")).toBeInTheDocument();
  await expect.element(input).toHaveValue("2");
});

it("searches across pages, walks matches, and wraps around", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0).toBe(true);

  await userEvent.fill(page.getByLabelText("Search document…"), "quick");

  await expect.element(page.getByTestId("pdf-match-count")).toHaveTextContent("1 of 3");
  await expect.poll(() => document.querySelectorAll("mark.lt-pdf-match").length).toBeGreaterThan(0);
  await expect.poll(() => document.querySelectorAll("mark.lt-pdf-match--current")).toHaveLength(1);

  await userEvent.click(page.getByRole("button", { name: "Next match" }));
  await expect.element(page.getByTestId("pdf-match-count")).toHaveTextContent("2 of 3");

  await userEvent.click(page.getByRole("button", { name: "Next match" }));
  await expect.element(page.getByTestId("pdf-match-count")).toHaveTextContent("3 of 3");
  await expect.element(page.getByText("Another quick line on page two.")).toBeInTheDocument();

  await userEvent.click(page.getByRole("button", { name: "Next match" }));
  await expect.element(page.getByTestId("pdf-match-count")).toHaveTextContent("1 of 3");
});

it("keeps the toolbar in place while search navigation scrolls only the page container", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0).toBe(true);

  await userEvent.fill(page.getByLabelText("Search document…"), "quick");
  await expect.element(page.getByTestId("pdf-match-count")).toHaveTextContent("1 of 3");

  await userEvent.click(page.getByRole("button", { name: "Next match" }));
  await userEvent.click(page.getByRole("button", { name: "Next match" }));
  await expect.element(page.getByTestId("pdf-match-count")).toHaveTextContent("3 of 3");

  const scroller = document.querySelector(".lt-pdf-scroll")!;
  await expect.poll(() => scroller.scrollTop).toBeGreaterThan(0);
  expect(document.scrollingElement?.scrollTop ?? 0).toBe(0);

  const toolbar = document.querySelector(".lt-pdf-toolbar")!.getBoundingClientRect();
  expect(toolbar.top).toBeGreaterThanOrEqual(0);
});

it("grows with the document under maxHeight instead of forcing a fixed height", async () => {
  await renderViewer({ maxHeight: 5000, initialZoom: 0.5 });

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0).toBe(true);

  const shell = document.querySelector<HTMLElement>('[data-test="pdf-viewer"]')!;
  await expect.poll(() => shell.getBoundingClientRect().height).toBeGreaterThan(240);
  expect(shell.getBoundingClientRect().height).toBeLessThan(5000);
  expect(shell.style.maxHeight).toBe("5000px");
});

it("reports no matches for text the document does not contain", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0).toBe(true);

  await userEvent.fill(page.getByLabelText("Search document…"), "zebra");

  await expect.element(page.getByTestId("pdf-match-count")).toHaveTextContent("No matches");
  await expect.element(page.getByRole("button", { name: "Next match" })).toBeDisabled();
});

it("shows the error state when the document cannot be loaded", async () => {
  await renderViewer({ url: "/definitely-missing.pdf" });

  await expect
    .element(page.getByRole("alert"))
    .toHaveTextContent("The document could not be loaded.");
});

it("renders through the Composer entry's prebuilt engine", async () => {
  await renderViewer({}, composerRegistry);

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0).toBe(true);
});

it("renders the standalone artifact's engine against the runtime barrel", async () => {
  await renderViewer({}, distRegistry);

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0).toBe(true);
});

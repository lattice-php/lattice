import { page, userEvent } from "vitest/browser";
import { expect, it, vi } from "vitest";
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

// Worker boot, parsing, and canvas paint take well over the 1s assertion
// default when the whole browser suite runs in parallel.
const WAIT = { timeout: 15_000, interval: 100 };

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
      height: "480px",
      maxHeight: null,
      sidebar: true,
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

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);
  await expect.poll(() => canvasInk(), WAIT).toBeGreaterThan(50);
  await expect.element(page.getByTestId("pdf-page-indicator")).toHaveTextContent("of 5");
  await expect
    .element(page.getByText("The quick brown fox jumps over the lazy dog,"))
    .toBeInTheDocument();
});

it("opens external link annotations in a new tab", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);

  const link = page.getByRole("link", { name: "Open https://mozilla.github.io/pdf.js/" });
  await expect.element(link, WAIT).toHaveAttribute("href", "https://mozilla.github.io/pdf.js/");
  await expect.element(link).toHaveAttribute("target", "_blank");
  await expect.element(link).toHaveAttribute("rel", "noopener noreferrer");
});

it("navigates internal link annotations inside the viewer", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);

  const input = page.getByLabelText("Go to page", { exact: true });
  await userEvent.fill(input, "5");
  await userEvent.keyboard("{Enter}");

  const scroller = document.querySelector(".lt-pdf-scroll")!;
  await expect.poll(() => scroller.scrollTop, WAIT).toBeGreaterThan(0);
  await expect.element(input, WAIT).toHaveValue("5");

  await userEvent.click(page.getByRole("link", { name: "Go to page 1" }));

  await expect.poll(() => scroller.scrollTop, WAIT).toBe(0);
  await expect.element(input, WAIT).toHaveValue("1");
  expect(document.scrollingElement?.scrollTop ?? 0).toBe(0);
});

it("jumps to a page through the sidebar thumbnails", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);

  await userEvent.click(page.getByRole("button", { name: "Toggle sidebar" }));

  await expect
    .poll(() => document.querySelectorAll('[data-test="pdf-thumbnail"]').length, WAIT)
    .toBe(5);
  await expect
    .poll(() =>
      document
        .querySelector('[data-test="pdf-thumbnail"][aria-current="page"]')
        ?.getAttribute("data-page"),
    )
    .toBe("1");

  await userEvent.click(page.getByRole("button", { name: "Go to page 3" }));

  await expect.element(page.getByLabelText("Go to page", { exact: true }), WAIT).toHaveValue("3");
  await expect
    .poll(
      () =>
        document
          .querySelector('[data-test="pdf-thumbnail"][aria-current="page"]')
          ?.getAttribute("data-page"),
      WAIT,
    )
    .toBe("3");
});

it("lists embedded attachments and downloads them as a blob", async () => {
  const createObjectURL = vi.spyOn(URL, "createObjectURL");

  try {
    await renderViewer();

    await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);

    await userEvent.click(page.getByRole("button", { name: "Toggle sidebar" }));
    await userEvent.click(page.getByRole("radio", { name: "Attachments" }));

    const attachment = page.getByTestId("pdf-attachment");
    await expect.element(attachment, WAIT).toHaveTextContent("invoice-data.csv");

    await userEvent.click(attachment);

    await expect.poll(() => createObjectURL.mock.calls.length, WAIT).toBe(1);
  } finally {
    createObjectURL.mockRestore();
  }
});

it("draws actual page pixels at a retina devicePixelRatio", async () => {
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 2 });

  try {
    await renderViewer({ initialZoom: 1 });

    await expect.poll(() => renderedCanvas()?.width ?? 0, WAIT).toBe(1224);
    await expect.poll(() => renderedCanvas()?.style.width ?? "", WAIT).toBe("612px");
    await expect.poll(() => canvasInk(), WAIT).toBeGreaterThan(50);
  } finally {
    delete (window as { devicePixelRatio?: number }).devicePixelRatio;
  }
});

it("zooms the rendered page and returns to fit width", async () => {
  await renderViewer({ initialZoom: 1 });

  await expect
    .poll(() => Number.parseFloat(renderedCanvas()?.style.width ?? ""), WAIT)
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

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);

  const input = page.getByLabelText("Go to page", { exact: true });
  await userEvent.fill(input, "2");
  await userEvent.keyboard("{Enter}");

  await expect.element(page.getByText("1. Reading text"), WAIT).toBeInTheDocument();
  await expect.element(input).toHaveValue("2");
});

it("searches across pages, walks matches, and wraps around", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);

  await userEvent.fill(page.getByLabelText("Search document…"), "quick");

  await expect.element(page.getByTestId("pdf-match-count"), WAIT).toHaveTextContent("1 of 5");
  await expect.poll(() => CSS.highlights.get("lt-pdf-match")?.size ?? 0, WAIT).toBeGreaterThan(0);
  await expect.poll(() => CSS.highlights.get("lt-pdf-match-current")?.size ?? 0, WAIT).toBe(1);

  await userEvent.click(page.getByRole("button", { name: "Next match" }));
  await expect.element(page.getByTestId("pdf-match-count"), WAIT).toHaveTextContent("2 of 5");

  await userEvent.click(page.getByRole("button", { name: "Previous match" }));
  await expect.element(page.getByTestId("pdf-match-count"), WAIT).toHaveTextContent("1 of 5");

  await userEvent.click(page.getByRole("button", { name: "Previous match" }));
  await expect.element(page.getByTestId("pdf-match-count"), WAIT).toHaveTextContent("5 of 5");
});

it("keeps the toolbar in place while search navigation scrolls only the page container", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);

  await userEvent.fill(page.getByLabelText("Search document…"), "quick");
  await expect.element(page.getByTestId("pdf-match-count"), WAIT).toHaveTextContent("1 of 5");

  await userEvent.click(page.getByRole("button", { name: "Next match" }));
  await userEvent.click(page.getByRole("button", { name: "Next match" }));
  await expect.element(page.getByTestId("pdf-match-count"), WAIT).toHaveTextContent("3 of 5");

  const scroller = document.querySelector(".lt-pdf-scroll")!;
  await expect.poll(() => scroller.scrollTop).toBeGreaterThan(0);
  expect(document.scrollingElement?.scrollTop ?? 0).toBe(0);

  const toolbar = document.querySelector(".lt-pdf-toolbar")!.getBoundingClientRect();
  expect(toolbar.top).toBeGreaterThanOrEqual(0);
});

it("grows with the document under maxHeight instead of forcing a fixed height", async () => {
  await renderViewer({ maxHeight: "5000px", initialZoom: 0.5 });

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);

  const shell = document.querySelector<HTMLElement>('[data-test="manual"]')!;
  await expect.poll(() => shell.getBoundingClientRect().height, WAIT).toBeGreaterThan(240);
  expect(shell.getBoundingClientRect().height).toBeLessThan(5000);
  expect(shell.style.maxHeight).toBe("5000px");
});

it("reports no matches for text the document does not contain", async () => {
  await renderViewer();

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);

  await userEvent.fill(page.getByLabelText("Search document…"), "zebra");

  await expect.element(page.getByTestId("pdf-match-count"), WAIT).toHaveTextContent("No matches");
  await expect.element(page.getByRole("button", { name: "Next match" })).toBeDisabled();
});

it("shows the error state when the document cannot be loaded", async () => {
  await renderViewer({ url: "/definitely-missing.pdf" });

  await expect
    .element(page.getByRole("alert"), WAIT)
    .toHaveTextContent("The document could not be loaded.");
});

it("renders through the Composer entry's prebuilt engine", async () => {
  await renderViewer({}, composerRegistry);

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);
});

it("renders the standalone artifact's engine against the runtime barrel", async () => {
  await renderViewer({}, distRegistry);

  await expect.poll(() => (renderedCanvas()?.width ?? 0) > 0, WAIT).toBe(true);
});

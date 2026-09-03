import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createRegistry, eagerComponent, Renderer } from "@lattice-php/core";
import { fakeNode, renderWithRegistry } from "@lattice-php/core/test-support";
import PdfViewerComponent from "./pdf-viewer";
import type { PdfEngineProps } from "./engine-registry";
import plugin from "./plugin";
import composerPlugin from "./plugin.composer";

function pdfNode() {
  return fakeNode({
    id: "manual",
    type: "pdf",
    props: {
      url: "https://files.example.test/manual.pdf",
      workerUrl: "/lattice/pdf/worker.js",
      filename: null,
      downloadable: true,
      searchable: true,
      height: "480px",
      maxHeight: null,
      sidebar: true,
      initialZoom: null,
      cmapUrl: null,
      standardFontDataUrl: null,
      wasmUrl: null,
    },
  });
}

it("reports a missing engine instead of crashing", () => {
  const registry = createRegistry({
    components: { pdf: eagerComponent(PdfViewerComponent) },
    name: "test/pdf-missing-engine",
  });

  renderWithRegistry(<Renderer nodes={[pdfNode()]} />, registry);

  expect(screen.getByRole("alert")).toHaveTextContent("The PDF engine is not available.");
});

it("hands the node to the registered engine extension", async () => {
  const StubEngine = ({ node }: PdfEngineProps) => (
    <output>engine received {node.props.url}</output>
  );
  const registry = createRegistry({
    components: { pdf: eagerComponent(PdfViewerComponent) },
    extensions: { "pdf.engine": { engine: StubEngine } },
    name: "test/pdf-stub-engine",
  });

  renderWithRegistry(<Renderer nodes={[pdfNode()]} />, registry);

  expect(
    await screen.findByText("engine received https://files.example.test/manual.pdf"),
  ).toBeInTheDocument();
});

it("mounts the engine only for nodes that carry a document", async () => {
  const StubEngine = ({ node }: PdfEngineProps) => (
    <output>engine received {node.props.url}</output>
  );
  const registry = createRegistry({
    components: { pdf: eagerComponent(PdfViewerComponent) },
    extensions: { "pdf.engine": { engine: StubEngine } },
    name: "test/pdf-template",
  });
  const template = pdfNode();
  template.id = "template";
  template.props.url = "";

  renderWithRegistry(<Renderer nodes={[template, pdfNode()]} />, registry);

  expect(await screen.findAllByRole("status")).toHaveLength(1);
});

it("registers the same wire surface from both plugin entries", () => {
  for (const entry of [plugin, composerPlugin]) {
    expect(entry.name).toBe("lattice/pdf");
    expect(Object.keys(entry.components)).toEqual(["pdf"]);
    expect(Object.keys(entry.extensions["pdf.engine"])).toEqual(["engine"]);
    expect(entry.i18n.namespace).toBe("pdf");
  }
});

import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Schema } from "@lattice-php/core/types";
import { createRegistry, eagerComponent } from "@lattice-php/core";
import {
  fakeNode,
  jsonResponse,
  renderWithRegistry,
  stubFetch,
  stubMatchMedia,
} from "@lattice-php/core/test-support";
import { renderWithModal, withModal } from "@lattice-php/ui/test/modal";
import { libraryRow } from "../test-support";
import { LibraryView } from "./library-view";
import type { UploadItem } from "./use-media-upload";

/** The transport is covered in use-media-upload.test.ts; here only the wiring matters. */
const upload = vi.hoisted(() => ({
  uploads: [] as UploadItem[],
  addFiles: vi.fn(),
  retry: vi.fn(),
  dismiss: vi.fn(),
}));

vi.mock("./use-media-upload", () => ({ useMediaUpload: () => upload }));

function uploadItem(overrides: Partial<UploadItem> = {}): UploadItem {
  return {
    id: "u1",
    name: "alpha.jpg",
    status: "uploading",
    progress: 0,
    file: new File(["bytes"], "alpha.jpg", { type: "image/jpeg" }),
    ...overrides,
  };
}

function column(key: string, sortable = true) {
  return { type: "column.text", key, props: { key, label: key, sortable } };
}

function libraryNode({
  picker = true,
  rows = [libraryRow(1), libraryRow(2)],
  actions = true,
  inspector = true,
}: {
  actions?: boolean;
  inspector?: boolean;
  picker?: boolean;
  rows?: ReturnType<typeof libraryRow>[];
} = {}) {
  return fakeNode({
    type: "media.library",
    props: { picker, accept: null, signed: false, inspector },
    schema: [
      {
        type: "table",
        props: {
          columns: [column("name"), column("size"), column("mime_type", false)],
          data: rows,
          endpoint: "/lattice/tables/media",
        },
      },
      ...(actions
        ? [
            { type: "action", key: "media-update", props: { endpoint: "/update", ref: "ref-1" } },
            { type: "action", key: "media-delete", props: { endpoint: "/delete", ref: "ref-1" } },
          ]
        : []),
    ] as Schema,
  });
}

describe("LibraryView", () => {
  beforeEach(() => {
    upload.uploads = [];
    // The view preference is persisted, so it would leak into the next test.
    window.localStorage.clear();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("deselects a single-select pick when the same card is clicked twice", () => {
    renderWithModal(
      <LibraryView node={libraryNode()} pick={{ multiple: false, onConfirm: vi.fn() }} />,
    );

    const [card] = screen.getAllByTestId("media-card");

    fireEvent.click(card);
    expect(screen.getByTestId("media-pick-confirm")).toBeEnabled();

    fireEvent.click(card);
    expect(screen.getByTestId("media-pick-confirm")).toBeDisabled();
  });

  it("shows a selection counter once a max is configured", () => {
    renderWithModal(
      <LibraryView node={libraryNode()} pick={{ multiple: true, max: 2, onConfirm: vi.fn() }} />,
    );

    expect(screen.getByTestId("media-pick-counter")).toHaveTextContent("0/2");

    fireEvent.click(screen.getAllByTestId("media-card")[0]);

    expect(screen.getByTestId("media-pick-counter")).toHaveTextContent("1/2");
  });

  it("refuses to select past the max but always allows deselecting", () => {
    renderWithModal(
      <LibraryView node={libraryNode()} pick={{ multiple: true, max: 1, onConfirm: vi.fn() }} />,
    );

    const [first, second] = screen.getAllByTestId("media-card");

    fireEvent.click(first);
    expect(screen.getByTestId("media-pick-confirm")).toBeEnabled();

    fireEvent.click(second);
    expect(screen.getByTestId("media-pick-counter")).toHaveTextContent("1/1");

    fireEvent.click(first);
    expect(screen.getByTestId("media-pick-confirm")).toBeDisabled();

    fireEvent.click(second);
    expect(screen.getByTestId("media-pick-counter")).toHaveTextContent("1/1");
  });

  it("has no inspector in pick mode: a card click only selects", () => {
    renderWithModal(
      <LibraryView node={libraryNode()} pick={{ multiple: true, onConfirm: vi.fn() }} />,
    );

    fireEvent.click(screen.getAllByTestId("media-card")[0]);

    expect(screen.queryByTestId("media-inspector")).not.toBeInTheDocument();
    expect(screen.getByTestId("media-pick-confirm")).toBeEnabled();
  });

  it("opens the clicked file in the inspector and saves the edited alt text", async () => {
    const fetch = stubFetch(jsonResponse({ success: true }));

    renderWithModal(<LibraryView node={libraryNode({ picker: false })} />);

    expect(screen.getByTestId("media-inspector-empty")).toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId("media-card")[1]);

    expect(screen.getByTestId("media-detail-name")).toHaveValue("file-2.jpg");

    fireEvent.change(screen.getByTestId("media-detail-alt"), { target: { value: "A logo" } });
    fireEvent.click(screen.getByTestId("media-detail-save"));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/update", expect.anything()));

    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({
      media_id: 2,
      name: "file-2.jpg",
      alt: "A logo",
    });
  });

  it("closes the inspector again", () => {
    renderWithModal(<LibraryView node={libraryNode({ picker: false })} />);

    fireEvent.click(screen.getAllByTestId("media-card")[0]);
    expect(screen.getByTestId("media-detail")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("media-detail-close"));

    expect(screen.queryByTestId("media-detail")).not.toBeInTheDocument();
    expect(screen.getByTestId("media-inspector-empty")).toBeInTheDocument();
  });

  it("leaves a card click inert when the library was composed without an inspector", () => {
    renderWithModal(<LibraryView node={libraryNode({ picker: false, inspector: false })} />);

    fireEvent.click(screen.getAllByTestId("media-card")[0]);

    expect(screen.queryByTestId("media-inspector")).not.toBeInTheDocument();
    expect(screen.queryByTestId("media-detail")).not.toBeInTheDocument();
  });

  it("previews a pdf through the viewer node the library composed", () => {
    const pdf = fakeNode({
      id: "media-pdf",
      key: "media-pdf",
      type: "pdf",
      props: { url: "", filename: null, height: "480px", maxHeight: "20rem" },
    });
    const node = libraryNode({
      picker: false,
      rows: [libraryRow(7, { mime_type: "application/pdf", name: "manual.pdf", url: "/files/7" })],
    });
    node.schema = [...(node.schema ?? []), pdf];
    const registry = createRegistry({
      components: {
        pdf: eagerComponent(({ node: viewer }) => (
          <output>
            viewing {String(viewer.props?.url)} as {String(viewer.props?.filename)}
          </output>
        )),
      },
      name: "test/media-pdf",
    });

    renderWithRegistry(withModal(<LibraryView node={node} />), registry);

    fireEvent.click(screen.getAllByTestId("media-card")[0]);

    expect(screen.getByRole("status")).toHaveTextContent("viewing /files/7 as manual.pdf");
  });

  it("falls back to the type icon when no viewer node was composed", () => {
    const node = libraryNode({
      picker: false,
      rows: [libraryRow(7, { mime_type: "application/pdf", name: "manual.pdf", url: "/files/7" })],
    });

    renderWithModal(<LibraryView node={node} />);

    fireEvent.click(screen.getAllByTestId("media-card")[0]);

    expect(screen.getByTestId("media-detail-preview")).toHaveTextContent("pdf");
  });

  it("summarizes a multi-selection instead of one file's details", () => {
    renderWithModal(<LibraryView node={libraryNode({ picker: false })} />);

    const [first, second] = screen.getAllByTestId("media-card-select");

    fireEvent.click(first);
    fireEvent.click(second);

    expect(screen.getByTestId("media-selection-summary")).toHaveTextContent("2 selected");
    expect(screen.queryByTestId("media-detail")).not.toBeInTheDocument();
  });

  it("extends the selection to the shift-clicked row", () => {
    const rows = [libraryRow(1), libraryRow(2), libraryRow(3), libraryRow(4)];

    renderWithModal(<LibraryView node={libraryNode({ picker: false, rows })} />);

    const checkboxes = screen.getAllByTestId("media-card-select");

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[2], { shiftKey: true });

    expect(screen.getByTestId("media-selection-summary")).toHaveTextContent("3 selected");
  });

  it("switches from the grid to the compact list", () => {
    renderWithModal(<LibraryView node={libraryNode({ picker: false })} />);

    expect(screen.getByTestId("media-grid")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "List" }));

    expect(screen.getByTestId("media-list")).toBeInTheDocument();
    expect(screen.queryByTestId("media-grid")).not.toBeInTheDocument();
  });

  it("requests the chosen sort order and offers only sortable columns", async () => {
    const fetch = stubFetch(jsonResponse({ data: [], query: {} }));

    renderWithModal(<LibraryView node={libraryNode({ picker: false })} />);

    const sort = screen.getByTestId("media-sort");

    expect(sort).not.toHaveTextContent("mime_type");

    fireEvent.change(sort, { target: { value: "size:desc" } });

    await waitFor(() =>
      expect(String(fetch.mock.calls[0][0])).toContain(`${encodeURIComponent("sort")}=-size`),
    );
  });

  it("shows the rejection reason and offers retry and dismiss on a failed upload", () => {
    const failed = uploadItem({ status: "error", reason: "The file is too large." });
    upload.uploads = [failed];

    renderWithModal(<LibraryView node={libraryNode()} />);

    expect(screen.getByTestId("media-upload-reason")).toHaveTextContent("The file is too large.");

    fireEvent.click(screen.getByTestId("media-upload-retry"));
    fireEvent.click(screen.getByTestId("media-upload-dismiss"));

    expect(upload.retry).toHaveBeenCalledWith(failed);
    expect(upload.dismiss).toHaveBeenCalledWith("u1");
  });

  it("falls back to the generic failure text and shows progress while in flight", () => {
    upload.uploads = [
      uploadItem({ status: "error" }),
      uploadItem({ id: "u2", name: "beta.jpg", progress: 40 }),
    ];

    renderWithModal(<LibraryView node={libraryNode()} />);

    expect(screen.getByTestId("media-upload-reason")).toHaveTextContent("Upload failed");
    expect(screen.getAllByTestId("media-upload-retry")).toHaveLength(1);
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("keeps accepting drops while the inline inspector is open, and always cancels the browser's native drop", () => {
    renderWithModal(<LibraryView node={libraryNode({ picker: false })} />);

    const dropped = { dataTransfer: { files: [new File(["bytes"], "alpha.jpg")] } };
    const wrapper = screen.getByTestId("media-library");

    // A canceled dispatchEvent() returns false — HTML5 DnD only treats an
    // element as a drop target if dragover was canceled, so both handlers must
    // preventDefault() regardless of the guard, or the browser navigates the
    // tab to the dropped file instead of firing a synthetic drop at all.
    expect(fireEvent.dragOver(wrapper)).toBe(false);
    expect(fireEvent.drop(wrapper, dropped)).toBe(false);
    expect(upload.addFiles).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getAllByTestId("media-card")[0]);
    expect(screen.getByTestId("media-detail")).toBeInTheDocument();

    fireEvent.drop(wrapper, dropped);

    expect(upload.addFiles).toHaveBeenCalledTimes(2);
  });

  it("ignores a drop behind the slideout that replaces the inspector on a narrow viewport", () => {
    stubMatchMedia(false);

    renderWithModal(<LibraryView node={libraryNode({ picker: false })} />);

    const dropped = { dataTransfer: { files: [new File(["bytes"], "alpha.jpg")] } };
    const wrapper = screen.getByTestId("media-library");

    fireEvent.click(screen.getAllByTestId("media-card")[0]);
    expect(screen.getByTestId("media-detail")).toBeInTheDocument();

    expect(fireEvent.dragOver(wrapper)).toBe(false);
    expect(fireEvent.drop(wrapper, dropped)).toBe(false);

    expect(upload.addFiles).not.toHaveBeenCalled();
  });

  it("dims the grid while the table reloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => {})),
    );

    renderWithModal(<LibraryView node={libraryNode()} />);

    expect(screen.getByTestId("media-grid")).toHaveAttribute("aria-busy", "false");

    fireEvent.change(screen.getByTestId("media-type-filter"), { target: { value: "image" } });

    await waitFor(() => {
      expect(screen.getByTestId("media-grid")).toHaveAttribute("aria-busy", "true");
    });
  });
});

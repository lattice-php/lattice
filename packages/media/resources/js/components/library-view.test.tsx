import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Schema } from "@lattice-php/core/types";
import { fakeNode } from "@lattice-php/core/test-support";
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

function row(id: number) {
  return {
    id,
    url: null,
    preview_url: null,
    name: `file-${id}.jpg`,
    mime_type: "image/jpeg",
    size: 100,
    alt: null,
    created_at: "2026-07-29T00:00:00Z",
    attachments_count: 0,
  };
}

function libraryNode() {
  return fakeNode({
    type: "media.library",
    props: { picker: true, accept: null, signed: false },
    schema: [
      {
        type: "table",
        props: { columns: [], data: [row(1), row(2)], endpoint: "/lattice/tables/media" },
      },
      { type: "action", key: "media-update", props: { endpoint: "/update", ref: "ref-1" } },
      { type: "action", key: "media-delete", props: { endpoint: "/delete", ref: "ref-1" } },
    ] as Schema,
  });
}

describe("LibraryView", () => {
  beforeEach(() => {
    upload.uploads = [];
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("deselects a single-select pick when the same card is clicked twice", () => {
    render(<LibraryView node={libraryNode()} pick={{ multiple: false, onConfirm: vi.fn() }} />);

    const [card] = screen.getAllByTestId("media-card");

    fireEvent.click(card);
    expect(screen.getByTestId("media-pick-confirm")).toBeEnabled();

    fireEvent.click(card);
    expect(screen.getByTestId("media-pick-confirm")).toBeDisabled();
  });

  it("shows a selection counter once a max is configured", () => {
    render(
      <LibraryView node={libraryNode()} pick={{ multiple: true, max: 2, onConfirm: vi.fn() }} />,
    );

    expect(screen.getByTestId("media-pick-counter")).toHaveTextContent("0/2");

    fireEvent.click(screen.getAllByTestId("media-card")[0]);

    expect(screen.getByTestId("media-pick-counter")).toHaveTextContent("1/2");
  });

  it("refuses to select past the max but always allows deselecting", () => {
    render(
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

  it("shows the rejection reason and offers retry and dismiss on a failed upload", () => {
    const failed = uploadItem({ status: "error", reason: "The file is too large." });
    upload.uploads = [failed];

    render(<LibraryView node={libraryNode()} />);

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

    render(<LibraryView node={libraryNode()} />);

    expect(screen.getByTestId("media-upload-reason")).toHaveTextContent("Upload failed");
    expect(screen.getAllByTestId("media-upload-retry")).toHaveLength(1);
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("ignores a drop while the detail slideout is open, but always cancels the browser's native drop", () => {
    render(<LibraryView node={libraryNode()} />);

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

    expect(fireEvent.dragOver(wrapper)).toBe(false);
    expect(fireEvent.drop(wrapper, dropped)).toBe(false);

    expect(upload.addFiles).toHaveBeenCalledTimes(1);
    expect(wrapper.className).not.toContain("border-lt-primary");
  });

  it("keeps accepting drops after a card click when there is no update/remove action to render a panel for", () => {
    const node = fakeNode({
      type: "media.library",
      props: { picker: true, accept: null, signed: false },
      schema: [
        {
          type: "table",
          props: { columns: [], data: [row(1)], endpoint: "/lattice/tables/media" },
        },
      ] as Schema,
    });

    render(<LibraryView node={node} />);

    fireEvent.click(screen.getAllByTestId("media-card")[0]);
    expect(screen.queryByTestId("media-detail")).not.toBeInTheDocument();

    const wrapper = screen.getByTestId("media-library");

    fireEvent.drop(wrapper, { dataTransfer: { files: [new File(["bytes"], "alpha.jpg")] } });

    expect(upload.addFiles).toHaveBeenCalledTimes(1);
  });

  it("dims the grid while the table reloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => {})),
    );

    render(<LibraryView node={libraryNode()} />);

    expect(screen.getByTestId("media-grid")).toHaveAttribute("aria-busy", "false");

    fireEvent.change(screen.getByTestId("media-type-filter"), { target: { value: "image" } });

    await waitFor(() => {
      expect(screen.getByTestId("media-grid")).toHaveAttribute("aria-busy", "true");
    });

    expect(screen.getByTestId("media-grid").className).toContain("opacity-60");
  });
});

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaUpload } from "./use-media-upload";

const apiFetch = vi.hoisted(() => vi.fn<(...args: unknown[]) => Promise<Response>>());

// The core package ships as one bundle, so every subpath specifier resolves to
// the same module and the real requestSignedUpload calls its internal apiFetch,
// bypassing a plain module mock. Register one consistent factory for both
// specifiers, routing requestSignedUpload through the apiFetch mock while
// keeping xhrTransfer real.
const coreMock = vi.hoisted(() => async (importOriginal: () => Promise<object>) => ({
  ...(await importOriginal()),
  apiFetch,
  requestSignedUpload: (
    endpoint: string,
    {
      ref,
      target,
      filename,
      contentType,
      values,
    }: import("@lattice-php/core/upload").SignedUploadRequest,
  ) =>
    apiFetch(endpoint, {
      method: "POST",
      ref,
      body: JSON.stringify({ ...values, _sub: "upload", _target: target, filename, contentType }),
      throwOnError: false,
    }),
}));

vi.mock("@lattice-php/core/api", coreMock);
vi.mock("@lattice-php/core/upload", coreMock);

const reloadEffects = JSON.stringify({
  effects: [{ type: "reload-component", props: { component: "media.library" } }],
});

/** What the upload action really returns: a per-request toast alongside the reload. */
const uploadEffects = JSON.stringify({
  effects: [
    { type: "toast", props: { message: "1 file(s) uploaded" } },
    { type: "reload-component", props: { component: "media.library" } },
  ],
});

class FakeRequest {
  static instances: FakeRequest[] = [];

  body: unknown = null;

  headers: Record<string, string> = {};

  method = "";

  onerror: (() => void) | null = null;

  onload: (() => void) | null = null;

  responseText = "";

  status = 0;

  upload: {
    onprogress:
      | ((event: { lengthComputable: boolean; loaded: number; total: number }) => void)
      | null;
  } = { onprogress: null };

  url = "";

  constructor() {
    FakeRequest.instances.push(this);
  }

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  /** Reports progress but stays in flight, so the uploading state is observable. */
  send(body: unknown): void {
    this.body = body;
    this.progress(3);
  }

  progress(loaded: number): void {
    this.upload.onprogress?.({ lengthComputable: true, loaded, total: 10 });
  }

  finish(status = 200, responseText = reloadEffects): void {
    this.status = status;
    this.responseText = responseText;
    this.onload?.();
  }
}

function file(name: string): File {
  return new File(["bytes"], name, { type: "image/jpeg" });
}

function renderUpload(signed = false) {
  return renderHook(() =>
    useMediaUpload({ endpoint: "/lattice/actions/media-upload", ref: "ref-1", signed }),
  );
}

describe("useMediaUpload", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=csrf-token";
    apiFetch.mockReset();
    FakeRequest.instances = [];
    vi.stubGlobal("XMLHttpRequest", FakeRequest);
  });

  it("posts one multipart request per file and tracks their progress apart", async () => {
    const { result } = renderUpload();
    const [first, second] = [file("alpha.jpg"), file("beta.jpg")];

    act(() => result.current.addFiles([first, second]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(2));

    const [alpha, beta] = FakeRequest.instances;

    expect(alpha.method).toBe("POST");
    expect(alpha.url).toBe("/lattice/actions/media-upload");
    expect(alpha.headers).toMatchObject({
      Accept: "application/json",
      "X-Lattice-Ref": "ref-1",
      "X-XSRF-TOKEN": "csrf-token",
    });
    expect(alpha.headers["Content-Type"]).toBeUndefined();
    expect((alpha.body as FormData).getAll("files[]")).toEqual([first]);
    expect((beta.body as FormData).getAll("files[]")).toEqual([second]);

    act(() => beta.progress(9));

    await waitFor(() => {
      expect(result.current.uploads).toEqual([
        expect.objectContaining({ name: "alpha.jpg", status: "uploading", progress: 30 }),
        expect.objectContaining({ name: "beta.jpg", status: "uploading", progress: 90 }),
      ]);
    });
  });

  it("keeps a rejected file while the rest of the batch lands", async () => {
    const { result } = renderUpload();

    act(() => result.current.addFiles([file("alpha.jpg"), file("beta.jpg")]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(2));
    await act(async () => {
      FakeRequest.instances[0].finish();
      FakeRequest.instances[1].finish(422, JSON.stringify({ errors: { "files.0": ["Too big."] } }));
    });

    await waitFor(() => {
      expect(result.current.uploads).toEqual([
        expect.objectContaining({ name: "beta.jpg", status: "error", reason: "Too big." }),
      ]);
    });
  });

  it("swallows the per-file toasts and dispatches one for the batch", async () => {
    const toasted = vi.fn();
    window.addEventListener("lattice:toast", toasted);
    const { result } = renderUpload();

    act(() => result.current.addFiles([file("alpha.jpg"), file("beta.jpg")]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(2));
    await act(async () => {
      FakeRequest.instances[0].finish(200, uploadEffects);
      FakeRequest.instances[1].finish(200, uploadEffects);
    });

    await waitFor(() => expect(toasted).toHaveBeenCalledTimes(1));

    expect(toasted).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { message: "2 file(s) uploaded" } }),
    );

    window.removeEventListener("lattice:toast", toasted);
  });

  it("stays silent when every file fails", async () => {
    const toasted = vi.fn();
    const reloaded = vi.fn();
    window.addEventListener("lattice:toast", toasted);
    window.addEventListener("lattice:reload-component", reloaded);
    const { result } = renderUpload();

    act(() => result.current.addFiles([file("alpha.jpg")]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(1));
    await act(async () => {
      FakeRequest.instances[0].finish(422, uploadEffects);
    });

    await waitFor(() => expect(result.current.uploads).toHaveLength(1));

    expect(toasted).not.toHaveBeenCalled();
    expect(reloaded).not.toHaveBeenCalled();

    window.removeEventListener("lattice:toast", toasted);
    window.removeEventListener("lattice:reload-component", reloaded);
  });

  it("dispatches a single batched reload-component effect once the whole batch lands", async () => {
    const reloaded = vi.fn();
    window.addEventListener("lattice:reload-component", reloaded);
    const { result } = renderUpload();

    act(() => result.current.addFiles([file("alpha.jpg"), file("beta.jpg")]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(2));
    await act(async () => {
      FakeRequest.instances[0].finish();
      FakeRequest.instances[1].finish();
    });

    await waitFor(() => expect(result.current.uploads).toEqual([]));

    expect(reloaded).toHaveBeenCalledTimes(1);
    expect(reloaded).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { component: "media.library" } }),
    );

    window.removeEventListener("lattice:reload-component", reloaded);
  });

  it("falls back to the response message when the rejection is not per file", async () => {
    const { result } = renderUpload();

    act(() => result.current.addFiles([file("alpha.jpg")]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(1));
    await act(async () => {
      FakeRequest.instances[0].finish(422, JSON.stringify({ message: "The files are invalid." }));
    });

    await waitFor(() => {
      expect(result.current.uploads).toEqual([
        expect.objectContaining({
          name: "alpha.jpg",
          status: "error",
          reason: "The files are invalid.",
        }),
      ]);
    });
  });

  it("retries a failed file in place, then clears it once it lands", async () => {
    const { result } = renderUpload();

    act(() => result.current.addFiles([file("alpha.jpg")]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(1));
    await act(async () => {
      FakeRequest.instances[0].finish(422, JSON.stringify({ message: "Too big." }));
    });

    await waitFor(() => expect(result.current.uploads[0].status).toBe("error"));

    const [failed] = result.current.uploads;

    act(() => result.current.retry(failed));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(2));

    expect((FakeRequest.instances[1].body as FormData).getAll("files[]")).toEqual([failed.file]);
    expect(result.current.uploads).toEqual([
      expect.objectContaining({ id: failed.id, status: "uploading", reason: undefined }),
    ]);

    await act(async () => {
      FakeRequest.instances[1].finish();
    });

    await waitFor(() => expect(result.current.uploads).toEqual([]));
  });

  it("dismisses a failed file without retrying it", async () => {
    const { result } = renderUpload();

    act(() => result.current.addFiles([file("alpha.jpg")]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(1));
    await act(async () => {
      FakeRequest.instances[0].finish(500, "");
    });

    await waitFor(() => expect(result.current.uploads).toHaveLength(1));

    act(() => result.current.dismiss(result.current.uploads[0].id));

    expect(result.current.uploads).toEqual([]);
    expect(FakeRequest.instances).toHaveLength(1);
  });

  it("marks the file as failed when the transport reports no status", async () => {
    const { result } = renderUpload();

    act(() => result.current.addFiles([file("alpha.jpg")]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(1));
    await act(async () => {
      FakeRequest.instances[0].finish(0, "");
    });

    await waitFor(() => {
      expect(result.current.uploads).toEqual([
        expect.objectContaining({ name: "alpha.jpg", status: "error" }),
      ]);
    });
  });

  it("marks the file as failed when the request never reaches the server", async () => {
    const { result } = renderUpload();

    act(() => result.current.addFiles([file("alpha.jpg")]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(1));
    await act(async () => {
      FakeRequest.instances[0].onerror?.();
    });

    await waitFor(() => {
      expect(result.current.uploads).toEqual([
        expect.objectContaining({ name: "alpha.jpg", status: "error" }),
      ]);
    });
  });

  it("signs, puts the file, then finalizes the keys", async () => {
    apiFetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            key: "tmp/alpha.jpg",
            url: "https://storage.test/tmp/alpha.jpg?signature=1",
            headers: { "x-amz-acl": "private" },
            method: "PUT",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(reloadEffects, { status: 200 }));

    const { result } = renderUpload(true);

    act(() => result.current.addFiles([file("alpha.jpg")]));

    await waitFor(() => expect(FakeRequest.instances).toHaveLength(1));

    const request = FakeRequest.instances[0];

    expect(request.method).toBe("PUT");
    expect(request.url).toBe("https://storage.test/tmp/alpha.jpg?signature=1");
    expect(request.headers).toEqual({ "x-amz-acl": "private" });

    await act(async () => {
      request.finish(204, "");
    });

    await waitFor(() => expect(result.current.uploads).toEqual([]));

    expect(apiFetch).toHaveBeenNthCalledWith(
      1,
      "/lattice/actions/media-upload",
      expect.objectContaining({
        body: JSON.stringify({
          _sub: "upload",
          _target: "files",
          filename: "alpha.jpg",
          contentType: "image/jpeg",
        }),
      }),
    );
    expect(apiFetch).toHaveBeenNthCalledWith(
      2,
      "/lattice/actions/media-upload",
      expect.objectContaining({ body: JSON.stringify({ files: ["tmp/alpha.jpg"] }) }),
    );
  });

  it("marks a signed upload as failed when signing is rejected", async () => {
    apiFetch.mockResolvedValue(new Response(null, { status: 422 }));

    const { result } = renderUpload(true);

    act(() => result.current.addFiles([file("alpha.jpg")]));

    await waitFor(() => {
      expect(result.current.uploads).toEqual([
        expect.objectContaining({ name: "alpha.jpg", status: "error" }),
      ]);
    });

    expect(FakeRequest.instances).toEqual([]);
  });

  it("ignores a null selection", () => {
    const { result } = renderUpload();

    act(() => result.current.addFiles(null));

    expect(result.current.uploads).toEqual([]);
    expect(FakeRequest.instances).toEqual([]);
  });

  it("ignores an empty selection", () => {
    const { result } = renderUpload();

    act(() => result.current.addFiles([]));

    expect(result.current.uploads).toEqual([]);
    expect(FakeRequest.instances).toEqual([]);
  });

  it("ignores files when no endpoint is configured", () => {
    const { result } = renderHook(() =>
      useMediaUpload({ endpoint: "", ref: "ref-1", signed: false }),
    );

    act(() => result.current.addFiles([file("alpha.jpg")]));

    expect(result.current.uploads).toEqual([]);
    expect(FakeRequest.instances).toEqual([]);
  });
});

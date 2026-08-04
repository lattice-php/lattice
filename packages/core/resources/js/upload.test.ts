import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestSignedUpload, xhrTransfer } from "./upload";
type Progress = { lengthComputable: boolean; loaded: number; total: number };

class FakeUploadRequest {
  static instances: FakeUploadRequest[] = [];

  body: unknown = null;

  headers: Record<string, string> = {};

  method = "";

  onerror: (() => void) | null = null;

  onload: (() => void) | null = null;

  responseText = "";

  status = 200;

  upload: { onprogress: ((event: Progress) => void) | null } = { onprogress: null };

  url = "";

  constructor() {
    FakeUploadRequest.instances.push(this);
  }

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  send(body: unknown): void {
    this.body = body;
  }

  setRequestHeader(key: string, value: string): void {
    this.headers[key] = value;
  }
}

function startTransfer(onProgress?: (percent: number) => void): {
  request: FakeUploadRequest;
  transfer: Promise<Response>;
} {
  const transfer = xhrTransfer({
    url: "https://rustfs.test/tmp/lamp.jpg?signature=1",
    method: "PUT",
    body: new File(["image-data"], "lamp.jpg", { type: "image/jpeg" }),
    headers: { "x-amz-acl": "private", "content-length": 10 },
    onProgress,
  });

  return { request: FakeUploadRequest.instances[0] as FakeUploadRequest, transfer };
}

describe("xhrTransfer", () => {
  beforeEach(() => {
    FakeUploadRequest.instances = [];
    vi.stubGlobal("XMLHttpRequest", FakeUploadRequest);
  });

  it("opens the signed request with stringified headers and the raw body", () => {
    const { request } = startTransfer();

    expect(request.method).toBe("PUT");
    expect(request.url).toBe("https://rustfs.test/tmp/lamp.jpg?signature=1");
    expect(request.headers).toEqual({ "x-amz-acl": "private", "content-length": "10" });
    expect(request.body).toBeInstanceOf(File);
  });

  it("reports integer progress only while the length is computable", async () => {
    const percents: number[] = [];
    const { request, transfer } = startTransfer((percent) => percents.push(percent));

    request.upload.onprogress?.({ lengthComputable: true, loaded: 1, total: 3 });
    request.upload.onprogress?.({ lengthComputable: false, loaded: 2, total: 3 });
    request.onload?.();
    await transfer;

    expect(percents).toEqual([33]);
  });

  it("resolves a response carrying the transport status and body", async () => {
    const { request, transfer } = startTransfer();

    request.status = 200;
    request.responseText = JSON.stringify({ key: "tmp/lamp.jpg" });
    request.onload?.();

    const response = await transfer;

    expect(response.ok).toBe(true);
    expect(await response.json()).toEqual({ key: "tmp/lamp.jpg" });
  });

  it("maps a status of zero to a 500 response instead of hanging", async () => {
    const { request, transfer } = startTransfer();

    request.status = 0;
    request.onload?.();

    const response = await transfer;

    expect(response.status).toBe(500);
    expect(response.ok).toBe(false);
  });

  it("rejects when the transport fails", async () => {
    const { request, transfer } = startTransfer();

    request.onerror?.();

    await expect(transfer).rejects.toThrow(
      "Upload to https://rustfs.test/tmp/lamp.jpg?signature=1 failed",
    );
  });
});

describe("requestSignedUpload", () => {
  it("posts the upload envelope with the caller's form values spread in", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await requestSignedUpload("/forms/products", {
      ref: "sealed-ref",
      target: "items.0.images",
      filename: "lamp.jpg",
      contentType: "image/jpeg",
      values: { sku: "LMP-001", images: [] },
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "X-Lattice-Ref": "sealed-ref" });
    expect(init.body).toBe(
      JSON.stringify({
        sku: "LMP-001",
        images: [],
        _sub: "upload",
        _target: "items.0.images",
        filename: "lamp.jpg",
        contentType: "image/jpeg",
      }),
    );
  });

  it("omits the values spread and hands a rejected sign back to the caller", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(null, { status: 422 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await requestSignedUpload("/media/library", {
      ref: "sealed-ref",
      target: "files",
      filename: "lamp.jpg",
      contentType: "image/jpeg",
    });

    expect(response.status).toBe(422);
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).body).toBe(
      JSON.stringify({
        _sub: "upload",
        _target: "files",
        filename: "lamp.jpg",
        contentType: "image/jpeg",
      }),
    );
  });
});

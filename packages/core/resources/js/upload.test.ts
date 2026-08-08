import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeXhr } from "./test-support";
import { requestSignedUpload, xhrTransfer } from "./upload";

function startTransfer(onProgress?: (percent: number) => void): {
  request: FakeXhr;
  transfer: Promise<Response>;
} {
  const transfer = xhrTransfer({
    url: "https://rustfs.test/tmp/lamp.jpg?signature=1",
    method: "PUT",
    body: new File(["image-data"], "lamp.jpg", { type: "image/jpeg" }),
    headers: { "x-amz-acl": "private", "content-length": 10 },
    onProgress,
  });

  return { request: FakeXhr.instances[0] as FakeXhr, transfer };
}

describe("xhrTransfer", () => {
  beforeEach(() => {
    FakeXhr.reset();
    vi.stubGlobal("XMLHttpRequest", FakeXhr);
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

    request.progress(1, 3);
    request.upload.onprogress?.({ lengthComputable: false, loaded: 2, total: 3 });
    request.succeed();
    await transfer;

    expect(percents).toEqual([33]);
  });

  it("resolves a response carrying the transport status and body", async () => {
    const { request, transfer } = startTransfer();

    request.succeed(200, JSON.stringify({ key: "tmp/lamp.jpg" }));

    const response = await transfer;

    expect(response.ok).toBe(true);
    expect(await response.json()).toEqual({ key: "tmp/lamp.jpg" });
  });

  it("maps a status of zero to a 500 response instead of hanging", async () => {
    const { request, transfer } = startTransfer();

    request.succeed(0);

    const response = await transfer;

    expect(response.status).toBe(500);
    expect(response.ok).toBe(false);
  });

  it("rejects when the transport fails", async () => {
    const { request, transfer } = startTransfer();

    request.fail();

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

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(response.status).toBe(422);
    expect(init.body).toBe(
      JSON.stringify({
        _sub: "upload",
        _target: "files",
        filename: "lamp.jpg",
        contentType: "image/jpeg",
      }),
    );
  });
});

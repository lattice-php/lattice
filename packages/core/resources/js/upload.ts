import { apiFetch } from "./api";

export type Transfer = {
  url: string;
  method: string;
  body: FormData | File | Blob;
  headers: Record<string, unknown>;
  onProgress?: (percent: number) => void;
};

export type SignedUploadRequest = {
  ref: string;
  target: string;
  filename: string;
  contentType: string;
  values?: Record<string, unknown>;
};

export function xhrTransfer({
  url,
  method,
  body,
  headers,
  onProgress,
}: Transfer): Promise<Response> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open(method, url, true);
    Object.entries(headers).forEach(([key, value]) => request.setRequestHeader(key, String(value)));
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      try {
        resolve(new Response(request.responseText || null, { status: request.status || 500 }));
      } catch {
        reject(new Error(`Upload to ${url} returned an unusable response`));
      }
    };
    request.onerror = () => reject(new Error(`Upload to ${url} failed`));
    request.send(body);
  });
}

/**
 * Asks the component for a signed upload. Form fields spread their live values
 * in so the server-side schema walk can find the field inside repeater rows.
 */
export function requestSignedUpload(
  endpoint: string,
  { ref, target, filename, contentType, values }: SignedUploadRequest,
): Promise<Response> {
  return apiFetch(endpoint, {
    method: "POST",
    ref,
    body: JSON.stringify({
      ...values,
      _sub: "upload",
      _target: target,
      filename,
      contentType,
    }),
    throwOnError: false,
  });
}

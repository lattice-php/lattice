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
/**
 * XHR rather than fetch because only XHR reports upload progress. A transport
 * failure leaves `status` at 0, which `new Response` rejects as out of range, so
 * it is mapped to 500 — otherwise the promise never settles and the upload hangs.
 */
export declare function xhrTransfer({ url, method, body, headers, onProgress, }: Transfer): Promise<Response>;
/**
 * Asks the component for a signed upload. Form fields spread their live values
 * in so the server-side schema walk can find the field inside repeater rows.
 */
export declare function requestSignedUpload(endpoint: string, { ref, target, filename, contentType, values }: SignedUploadRequest): Promise<Response>;

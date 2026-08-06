import { useState } from "react";
import type { ActionEffect } from "@lattice-php/lattice";
import { runAction } from "@lattice-php/action/lib/run-action";
import { apiFetch, xsrfToken } from "@lattice-php/core/api";
import { withHeaders } from "@lattice-php/core/headers";
import { requestSignedUpload, xhrTransfer } from "@lattice-php/core/upload";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { useT } from "@lattice-php/ui/i18n";
import type { SignedUpload } from "@lattice-php/lattice/types/generated";

export type UploadItem = {
  id: string;
  name: string;
  status: "uploading" | "error";
  progress: number;
  reason?: string;
  file: File;
};

export type UploadTarget = {
  endpoint: string;
  ref: string;
  signed: boolean;
};

export type MediaUpload = {
  uploads: UploadItem[];
  addFiles: (files: FileList | File[] | null) => void;
  retry: (item: UploadItem) => void;
  dismiss: (id: string) => void;
};

type Settled = {
  ok: boolean;
  body: { message?: string; errors?: Record<string, string[]> };
  reload?: ActionEffect;
};

type Outcome = { ok: boolean; reload?: ActionEffect };

/** Laravel reports a rejected file under `files.<index>`; `message` covers request-level failures. */
function reasonFor({ body }: Settled, index: number): string | undefined {
  return body.errors?.[`files.${index}`]?.[0] ?? body.message;
}

/**
 * Drives the media library's uploads. Each file gets its own request, so
 * progress and validation failures are per file. A settled item leaves the
 * list — a single batched `reload-component` effect, dispatched once the whole
 * batch has settled, brings the new rows into the grid — so `uploads` only
 * ever holds in-flight and failed files.
 */
export function useMediaUpload({ endpoint, ref, signed }: UploadTarget): MediaUpload {
  const dispatch = useEffectDispatcher();
  const { t } = useT("media");
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  function update(id: string, changes: Partial<UploadItem>): void {
    setUploads((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }

  function remove(id: string): void {
    setUploads((previous) => previous.filter((item) => item.id !== id));
  }

  function settle(item: UploadItem, settled: Settled, index: number): void {
    if (settled.ok) {
      remove(item.id);

      return;
    }

    update(item.id, { status: "error", reason: reasonFor(settled, index) });
  }

  /**
   * `runAction` consumes the response body, so it is teed here: the parsed body
   * carries the failure reason and, for a signed upload, the signature itself.
   * `toast` and `reload-component` effects are dropped because one per file would
   * stack N toasts and N table reloads — the batch dispatches one of each once
   * every file has settled, reusing whichever settled response carried a reload.
   */
  async function send(request: () => Promise<Response>): Promise<Settled> {
    let body: Settled["body"] = {};
    let reload: ActionEffect | undefined;

    const ok = await runAction(
      async () => {
        const response = await request();
        body = (await response
          .clone()
          .json()
          .catch(() => ({}))) as Settled["body"];

        return response;
      },
      (effects) => {
        reload = effects.find((effect) => effect.type === "reload-component");
        dispatch(
          effects.filter((effect) => effect.type !== "toast" && effect.type !== "reload-component"),
        );
      },
    );

    return { ok, body, reload };
  }

  async function uploadMultipart(item: UploadItem): Promise<Outcome> {
    const body = new FormData();
    body.append("files[]", item.file);

    const settled = await send(() =>
      xhrTransfer({
        url: endpoint,
        method: "POST",
        body,
        headers: withHeaders(ref, {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": xsrfToken(),
        }),
        onProgress: (progress) => update(item.id, { progress }),
      }),
    );

    settle(item, settled, 0);

    return { ok: settled.ok, reload: settled.reload };
  }

  async function signAndPut(item: UploadItem): Promise<string | null> {
    const signature = await send(() =>
      requestSignedUpload(endpoint, {
        ref,
        target: "files",
        filename: item.file.name,
        contentType: item.file.type,
      }),
    );

    if (!signature.ok) {
      settle(item, signature, 0);

      return null;
    }

    const sign = signature.body as unknown as SignedUpload;
    const put = await xhrTransfer({
      url: sign.url,
      method: sign.method.toUpperCase(),
      body: item.file,
      headers: sign.headers,
      onProgress: (progress) => update(item.id, { progress }),
    }).catch(() => null);

    if (put?.ok === true) {
      return sign.key;
    }

    settle(item, { ok: false, body: {} }, 0);

    return null;
  }

  async function uploadSigned(items: UploadItem[]): Promise<Outcome[]> {
    const keys = await Promise.all(items.map(signAndPut));
    const uploaded = keys.filter((key): key is string => key !== null);

    if (uploaded.length === 0) {
      return items.map(() => ({ ok: false }));
    }

    const settled = await send(() =>
      apiFetch(endpoint, {
        method: "POST",
        ref,
        body: JSON.stringify({ files: uploaded }),
        throwOnError: false,
      }),
    );

    items
      .filter((_, index) => keys[index] !== null)
      .forEach((item, index) => settle(item, settled, index));

    return keys.map((key) => ({ ok: key !== null && settled.ok, reload: settled.reload }));
  }

  async function run(items: UploadItem[]): Promise<void> {
    const outcomes = signed
      ? await uploadSigned(items)
      : await Promise.all(items.map(uploadMultipart));
    const count = outcomes.filter((outcome) => outcome.ok).length;

    if (count === 0) {
      return;
    }

    const reload = outcomes.find((outcome) => outcome.reload)?.reload;

    dispatch([
      {
        type: "toast",
        props: {
          message: t("media.library.uploaded", "{{count}} file(s) uploaded", { count }),
        },
      },
      ...(reload ? [reload] : []),
    ]);
  }

  function addFiles(incoming: FileList | File[] | null): void {
    const files = Array.from(incoming ?? []);

    if (files.length === 0 || endpoint === "") {
      return;
    }

    const items = files.map<UploadItem>((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      status: "uploading",
      progress: 0,
      file,
    }));

    setUploads((previous) => [...previous, ...items]);
    void run(items);
  }

  function retry(item: UploadItem): void {
    update(item.id, { status: "uploading", progress: 0, reason: undefined });
    void run([item]);
  }

  return { uploads, addFiles, retry, dismiss: remove };
}

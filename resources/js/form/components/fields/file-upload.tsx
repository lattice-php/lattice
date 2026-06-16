import { apiFetch } from "@lattice-php/lattice/core/api";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { useFieldScope } from "../field-scope";
import { useFormValues, useSetFormValue } from "../values";

type Item = {
  id: string;
  name: string;
  size: number | null;
  status: "ready" | "uploading" | "error";
  progress: number;
  file?: File;
  key?: string;
  url?: string | null;
  token?: string;
  existing: boolean;
};

type SignResponse = {
  key: string;
  url: string;
  headers: Record<string, string>;
  method: string;
};

function uploadValueEquals(current: unknown, next: string[] | string): boolean {
  if (Array.isArray(next)) {
    return (
      Array.isArray(current) &&
      current.length === next.length &&
      current.every((value, index) => value === next[index])
    );
  }

  return current === next;
}

export const FileUploadComponent: RendererComponent<"field.file-upload"> = ({ node }) => {
  const { t } = useT("lattice");
  const props = node.props;
  const { hidden, required, readOnly, disabled } = useDependentField(node);
  const { action, componentRef, errors } = useFormContext();
  const name = props.name;
  const scope = useFieldScope();
  const domName = scope ? scope.scopedName(name) : name;
  const errorKey = scope ? scope.errorKey(name) : name;
  const uploadKey = errorKey;
  const values = useFormValues();
  const setValue = useSetFormValue();
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const locked = readOnly || disabled;
  const signed = props.signed;
  const multiple = props.multiple;
  const fieldName = multiple ? `${domName}[]` : domName;

  const initial = useMemo<Item[]>(
    () =>
      (props.files ?? []).map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        status: "ready" as const,
        progress: 100,
        key: file.key,
        url: file.url,
        token: file.token,
        existing: true,
      })),
    [props.files],
  );
  const [items, setItems] = useState<Item[]>(initial);
  const [removedTokens, setRemovedTokens] = useState<string[]>([]);

  useEffect(() => {
    if (!signed) {
      return;
    }

    const keys = items
      .filter((item) => !item.existing && item.key && item.status === "ready")
      .map((item) => item.key as string);
    const next = multiple ? keys : (keys[0] ?? "");

    if (scope) {
      if (!uploadValueEquals(scope.getValue(name), next)) {
        scope.setValue(name, next);
      }

      return;
    }

    setValue(name, next);
  }, [items, multiple, name, scope, setValue, signed]);

  useEffect(() => {
    if (!signed || scope) {
      return;
    }

    setValue(`${name}__removed`, removedTokens);
  }, [name, removedTokens, scope, setValue, signed]);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    },
    [],
  );

  const multipartFiles = items
    .filter((item) => item.file && !item.existing)
    .map((item) => item.file as File);
  useEffect(() => {
    if (signed || !fileInputRef.current) {
      return;
    }

    const transfer = new DataTransfer();
    multipartFiles.forEach((file) => transfer.items.add(file));
    fileInputRef.current.files = transfer.files;
  });

  function createPreviewUrl(file: File): string | undefined {
    if (!props.image) {
      return undefined;
    }

    const url = URL.createObjectURL(file);
    previewUrlsRef.current.add(url);

    return url;
  }

  function revokePreviewUrl(item: Item): void {
    if (!item.url || !previewUrlsRef.current.has(item.url)) {
      return;
    }

    URL.revokeObjectURL(item.url);
    previewUrlsRef.current.delete(item.url);
  }

  async function signAndUpload(item: Item, file: File): Promise<void> {
    const response = await apiFetch(action, {
      method: "POST",
      ref: componentRef,
      body: JSON.stringify({
        ...values,
        _upload: uploadKey,
        filename: file.name,
        contentType: file.type,
      }),
      throwOnError: false,
    });

    if (!response.ok) {
      setItems((prev) =>
        prev.map((entry) => (entry.id === item.id ? { ...entry, status: "error" } : entry)),
      );

      return;
    }

    const sign = (await response.json()) as SignResponse;

    await new Promise<void>((resolve) => {
      const request = new XMLHttpRequest();
      request.open(sign.method, sign.url, true);
      Object.entries(sign.headers).forEach(([key, value]) =>
        request.setRequestHeader(key, String(value)),
      );
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setItems((prev) =>
            prev.map((entry) => (entry.id === item.id ? { ...entry, progress } : entry)),
          );
        }
      };
      request.onload = () => {
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: request.status < 300 ? "ready" : "error",
                  key: sign.key,
                  progress: 100,
                }
              : entry,
          ),
        );
        resolve();
      };
      request.onerror = () => {
        setItems((prev) =>
          prev.map((entry) => (entry.id === item.id ? { ...entry, status: "error" } : entry)),
        );
        resolve();
      };
      request.send(file);
    });
  }

  function addFiles(fileList: FileList | null): void {
    if (!fileList || locked) {
      return;
    }

    const incoming = Array.from(fileList);
    const next = incoming.map<Item>((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      status: signed ? "uploading" : "ready",
      progress: 0,
      file,
      url: createPreviewUrl(file),
      existing: false,
    }));

    if (!multiple) {
      items.forEach(revokePreviewUrl);

      if (!scope) {
        const replacedTokens = items
          .filter((item) => item.existing && item.token)
          .map((item) => item.token as string);

        if (replacedTokens.length > 0) {
          setRemovedTokens((tokens) => [...tokens, ...replacedTokens]);
        }
      }
    }

    setItems((prev) => (multiple ? [...prev, ...next] : next));

    if (signed) {
      next.forEach((item, index) => void signAndUpload(item, incoming[index]));
    }
  }

  function removeItem(id: string): void {
    const target = items.find((item) => item.id === id);

    if (target) {
      revokePreviewUrl(target);
    }

    setItems((prev) => {
      if (target?.existing && target.token && !scope) {
        setRemovedTokens((tokens) => [...tokens, target.token as string]);
      }
      return prev.filter((i) => i.id !== id);
    });
  }

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={errors[errorKey]}
      helperText={props.helperText ?? undefined}
      tooltip={props.tooltip ?? undefined}
      label={props.label ?? ""}
      name={name}
      required={required}
    >
      <div
        className="flex flex-col gap-3 rounded-lt-sm border border-dashed border-lt-border bg-lt-surface px-4 py-6"
        data-test={testIdentity(name)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <button
          className="text-sm text-lt-muted-fg"
          disabled={locked}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          {t("file-upload.dropzone", "Drop files here or click to browse")}
        </button>

        <ul
          className={props.image ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "flex flex-col gap-2"}
        >
          {items.map((item) => (
            <li
              className={
                props.image
                  ? "flex min-w-0 items-center gap-3 rounded-lt-sm border border-lt-border bg-lt-bg p-2 text-sm"
                  : "flex items-center justify-between gap-3 text-sm"
              }
              key={item.id}
            >
              {props.image && item.url ? (
                <img
                  alt={item.name}
                  className="size-16 shrink-0 rounded-lt-sm border border-lt-border object-cover"
                  data-test={testIdentity(`${name}-preview`)}
                  src={item.url}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <span className="block truncate" data-test={testIdentity(`${name}-item`)}>
                  {item.name}
                </span>
                {item.status === "uploading" && (
                  <span className="text-xs text-lt-muted-fg">{item.progress}%</span>
                )}
                {item.status === "error" && (
                  <span className="text-xs text-lt-danger">
                    {t("file-upload.failed", "Failed")}
                  </span>
                )}
              </div>
              {(!item.existing || !scope) && (
                <button
                  aria-label={t("file-upload.remove", "Remove {{name}}", { name: item.name })}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-lt-sm text-lt-muted-fg transition-colors hover:bg-lt-accent hover:text-lt-accent-fg disabled:pointer-events-none disabled:opacity-50"
                  data-test={testIdentity(
                    item.existing ? `${name}-remove-existing` : `${name}-remove`,
                  )}
                  disabled={locked}
                  onClick={() => removeItem(item.id)}
                  type="button"
                >
                  <Icon name="x" aria-hidden="true" className="size-lt-icon-sm" />
                </button>
              )}
              {signed && !item.existing && item.key && item.status === "ready" && (
                <input
                  data-test={testIdentity(`${name}-uploaded`)}
                  name={fieldName}
                  type="hidden"
                  value={item.key}
                />
              )}
            </li>
          ))}
        </ul>

        {!scope &&
          removedTokens.map((token) => (
            <input key={token} name={`${name}__removed[]`} type="hidden" value={token} />
          ))}

        <input
          accept={props.accept ?? undefined}
          aria-label={props.label ?? name}
          className="sr-only"
          data-test={testIdentity(`${name}-input`)}
          id={inputId}
          multiple={multiple}
          name={signed ? undefined : fieldName}
          onChange={(event) => {
            addFiles(event.target.files);
            if (signed) {
              event.target.value = "";
            }
          }}
          ref={fileInputRef}
          type="file"
        />
      </div>
    </FormFieldFrame>
  );
};

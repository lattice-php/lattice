import { withRefHeader } from "@lattice-php/lattice/core/component-ref";
import { testIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { xsrfToken } from "../form-transport";
import { useDependentField } from "../use-dependent-field";

type Item = {
  id: string;
  name: string;
  size: number | null;
  status: "ready" | "uploading" | "error";
  progress: number;
  file?: File;
  key?: string;
  url?: string | null;
  existing: boolean;
};

type SignResponse = {
  key: string;
  url: string;
  headers: Record<string, string>;
  method: string;
};

export const FileUploadComponent: RendererComponent<"form.file-upload"> = ({ node }) => {
  const props = node.props;
  const { hidden, required, readOnly, disabled } = useDependentField(node);
  const { action, componentRef, errors } = useFormContext();
  const name = props.name;
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locked = readOnly || disabled;
  const signed = props.signed;
  const multiple = props.multiple ?? false;
  const fieldName = multiple ? `${name}[]` : name;

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
        existing: true,
      })),
    [props.files],
  );
  const [items, setItems] = useState<Item[]>(initial);

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

  async function signAndUpload(item: Item, file: File): Promise<void> {
    const response = await fetch(action, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-XSRF-TOKEN": xsrfToken(),
        ...withRefHeader(componentRef),
      },
      body: JSON.stringify({ _upload: name, filename: file.name, contentType: file.type }),
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
      existing: false,
    }));

    setItems((prev) => (multiple ? [...prev, ...next] : next));

    if (signed) {
      next.forEach((item, index) => void signAndUpload(item, incoming[index]));
    }
  }

  function removeItem(id: string): void {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (hidden) {
    return null;
  }

  return (
    <FormFieldFrame
      error={errors[name]}
      helperText={props.helperText ?? undefined}
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
          Drop files here or click to browse
        </button>

        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li className="flex items-center justify-between gap-3 text-sm" key={item.id}>
              <span data-test={testIdentity(`${name}-item`)}>{item.name}</span>
              {item.status === "uploading" && <span>{item.progress}%</span>}
              {item.status === "error" && <span className="text-lt-danger">Failed</span>}
              <button
                aria-label={`Remove ${item.name}`}
                disabled={locked}
                onClick={() => removeItem(item.id)}
                type="button"
              >
                Remove
              </button>
              {signed && item.key && item.status === "ready" && (
                <input name={fieldName} type="hidden" value={item.key} />
              )}
              {!signed && item.existing && item.key && (
                <input name={fieldName} type="hidden" value={item.key} />
              )}
            </li>
          ))}
        </ul>

        {signed ? (
          <input
            accept={props.accept ?? undefined}
            aria-label={props.label ?? name}
            className="sr-only"
            id={inputId}
            multiple={multiple}
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
            ref={fileInputRef}
            type="file"
          />
        ) : (
          <input
            accept={props.accept ?? undefined}
            aria-label={props.label ?? name}
            className="sr-only"
            id={inputId}
            multiple={multiple}
            name={fieldName}
            onChange={(event) => addFiles(event.target.files)}
            ref={fileInputRef}
            type="file"
          />
        )}
      </div>
    </FormFieldFrame>
  );
};

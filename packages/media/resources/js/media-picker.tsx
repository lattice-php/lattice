import { useRef, useState } from "react";
import { RenderNode } from "@lattice-php/core";
import type { Node, RendererComponent } from "@lattice-php/core/types";
import { SimpleField } from "@lattice-php/form/components/base/simple-field";
import { FieldScopeProvider } from "@lattice-php/form/hooks/field-scope";
import { translate, useT } from "@lattice-php/ui/i18n";
import { Button } from "@lattice-php/ui/components/button/button";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/ui/primitives/dialog";
import { IconButton } from "@lattice-php/ui/primitives/icon-button";
import {
  MODAL_MISSING_ERROR,
  useEmbeddedModal,
  useModal,
} from "@lattice-php/ui/components/modal/modal-host";
import { LibraryView, type MediaRow } from "./components/library-view";
import { UploadList } from "./components/upload-list";
import { useMediaUpload, type UploadedMedia } from "./components/use-media-upload";
import type { MediaPicker } from "./generated";

type Picked = NonNullable<MediaPicker["selected"]>[number];

const MediaPickerComponent: RendererComponent<"field.media-picker"> = ({ node }) => {
  const { t } = useT("media");
  const props = node.props;
  const host = useModal();
  const [picked, setPicked] = useState<Picked[]>(props.selected ?? []);
  const pickedRef = useRef(picked);
  pickedRef.current = picked;
  const libraryNode = node.schema?.find((child) => child.type === "media.library") as
    | Node<"media.library">
    | undefined;
  const template = node.schema?.filter((child) => child.type !== "media.library") ?? [];
  const hasFields = template.length > 0;
  const multiple = props.multiple;
  const maxFiles = props.maxFiles;
  const remaining =
    multiple && maxFiles !== null ? Math.max(0, maxFiles - picked.length) : undefined;

  return (
    <SimpleField label={props.label ?? ""} node={node}>
      {({ name, commit, disabled, readOnly }) => {
        const locked = disabled || readOnly;

        const valueOf = (rows: Picked[]) =>
          hasFields
            ? rows.map((entry) => ({ id: entry.id, ...entry.values }))
            : multiple
              ? rows.map((entry) => entry.id)
              : (rows[0]?.id ?? "");

        const apply = (next: Picked[]): void => {
          setPicked(next);
          commit(valueOf(next));
        };

        const setRowValue = (index: number, field: string, value: unknown): void => {
          apply(
            picked.map((row, i) =>
              i === index ? { ...row, values: { ...row.values, [field]: value } } : row,
            ),
          );
        };

        const confirmPick = (items: MediaRow[]): void => {
          const incoming = items.map((item) => ({
            ...item,
            values: pickedRef.current.find((entry) => entry.id === item.id)?.values ?? {},
          }));
          const merged = multiple
            ? [
                ...pickedRef.current.filter(
                  (entry) => !incoming.some((item) => item.id === entry.id),
                ),
                ...incoming,
              ]
            : incoming.slice(0, 1);

          apply(multiple && maxFiles !== null ? merged.slice(0, maxFiles) : merged);
        };

        return (
          <div className="flex flex-col gap-2" data-test={`media-picker-${name}`}>
            {hasFields ? (
              picked.map((item, index) => (
                <input key={item.id} name={`${name}[${index}][id]`} type="hidden" value={item.id} />
              ))
            ) : multiple ? (
              picked.map((item) => (
                <input key={item.id} name={`${name}[]`} type="hidden" value={item.id} />
              ))
            ) : (
              <input name={name} type="hidden" value={picked[0]?.id ?? ""} />
            )}

            {picked.length > 0 && (
              <ul className={hasFields ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}>
                {picked.map((item, index) => (
                  <li
                    className={
                      hasFields
                        ? "flex flex-col gap-3 rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-2 text-sm"
                        : "flex max-w-56 items-center gap-2 rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-1 text-sm"
                    }
                    data-test="media-picker-item"
                    key={item.id}
                  >
                    <div className="flex items-center gap-2">
                      {item.preview_url !== null && item.mime_type.startsWith("image/") && (
                        <img
                          alt=""
                          className="size-8 rounded-lt-xs object-cover"
                          src={item.preview_url}
                        />
                      )}
                      <span className="truncate text-lt-fg">{item.name}</span>
                      {!locked && (
                        <IconButton
                          data-test="media-picker-remove"
                          icon="x"
                          label={t("media.picker.remove", "Remove {{name}}", { name: item.name })}
                          onClick={() => apply(picked.filter((entry) => entry.id !== item.id))}
                        />
                      )}
                    </div>

                    {hasFields && !disabled && (
                      <FieldScopeProvider
                        base={name}
                        index={index}
                        onChange={(field, value) => setRowValue(index, field, value)}
                        row={{ id: item.id, ...item.values }}
                      >
                        <div className="flex flex-col gap-3" data-test="media-picker-item-fields">
                          {template.map((child, childIndex) => (
                            <RenderNode key={childIndex} node={child} />
                          ))}
                        </div>
                      </FieldScopeProvider>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {props.uploadOnly ? (
              <UploadOnlyPicker
                disabled={locked}
                libraryNode={libraryNode}
                multiple={multiple}
                onUploaded={(media) => {
                  const incoming = media.map((item) => ({ ...item, values: {} }));
                  const merged = multiple
                    ? [
                        ...picked.filter((entry) => !incoming.some((item) => item.id === entry.id)),
                        ...incoming,
                      ]
                    : incoming.slice(0, 1);

                  apply(multiple && maxFiles !== null ? merged.slice(0, maxFiles) : merged);
                }}
              />
            ) : (
              <Button
                className="self-start"
                data-test="media-picker-open"
                disabled={locked}
                onClick={() =>
                  libraryNode &&
                  host.open(
                    <MediaPickerOverlay
                      libraryNode={libraryNode}
                      max={remaining}
                      multiple={multiple}
                      onConfirm={confirmPick}
                    />,
                  )
                }
                type="button"
              >
                {props.pickerLabel ?? t("media.picker.open", "Choose from library")}
              </Button>
            )}
          </div>
        );
      }}
    </SimpleField>
  );
};

function MediaPickerOverlay({
  libraryNode,
  multiple,
  max,
  onConfirm,
}: {
  libraryNode: Node<"media.library">;
  multiple: boolean;
  max?: number;
  onConfirm: (items: MediaRow[]) => void;
}) {
  const { t } = useT("media");
  const context = useEmbeddedModal();

  if (!context) {
    throw new Error(MODAL_MISSING_ERROR);
  }

  return (
    <Dialog open={context.open} onOpenChange={context.onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="flex flex-col gap-5"
        data-test="media-picker-dialog"
        onCloseAutoFocus={context.onExited}
        width="3xl"
      >
        <DialogHeader
          closeLabel={translate("lattice", "common.close", "Close")}
          title={t("media.picker.heading", "Choose media")}
        />
        <LibraryView
          node={libraryNode}
          pick={{
            multiple,
            max,
            onConfirm: (items) => {
              onConfirm(items);
              context.onOpenChange(false);
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

/**
 * The upload-only face of the picker: the button opens the file dialog
 * directly and the settled batch is picked via onUploaded — the library grid
 * never renders, so other media stay out of sight.
 */
function UploadOnlyPicker({
  libraryNode,
  multiple,
  disabled,
  onUploaded,
}: {
  libraryNode: Node<"media.library"> | undefined;
  multiple: boolean;
  disabled: boolean;
  onUploaded: (media: UploadedMedia[]) => void;
}) {
  const { t } = useT("media");
  const uploadNode = libraryNode?.schema?.find((child) => child.key === "media-upload") as
    | Node<"action">
    | undefined;
  const { uploads, addFiles, retry, dismiss } = useMediaUpload({
    endpoint: uploadNode?.props.endpoint ?? "",
    ref: uploadNode?.props.ref ?? "",
    signed: libraryNode?.props.signed ?? false,
    onUploaded,
  });
  const fileInput = useRef<HTMLInputElement>(null);
  const label = uploadNode?.props.label ?? t("media.actions.upload.label", "Upload");
  const busy = uploads.some((item) => item.status === "uploading");

  return (
    <>
      <Button
        className="self-start"
        data-test="media-picker-upload"
        disabled={disabled || busy}
        onClick={() => fileInput.current?.click()}
        type="button"
      >
        {label}
      </Button>
      <input
        accept={libraryNode?.props.accept ?? undefined}
        aria-label={label}
        className="sr-only"
        data-test="media-picker-upload-input"
        multiple={multiple}
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
        ref={fileInput}
        type="file"
      />
      <UploadList dismiss={dismiss} retry={retry} uploads={uploads} />
    </>
  );
}

export default MediaPickerComponent;

import type { RendererComponent } from "@lattice-php/core/types";
import { useT } from "@lattice-php/ui/i18n";
import { IconButton } from "@lattice-php/ui/primitives/icon-button";
import { useDropzone } from "./dropzone-context";

export function DropzoneRemoveButton() {
  const { t } = useT("media");
  const dropzone = useDropzone();

  if (!dropzone) {
    return null;
  }

  return (
    <IconButton
      data-test="media-dropzone-remove"
      disabled={dropzone.disabled}
      icon="x"
      label={t("media.dropzone.remove", "Remove file")}
      onClick={dropzone.remove}
    />
  );
}

const DropzoneRemoveComponent: RendererComponent<"media.dropzone-remove"> = () => (
  <DropzoneRemoveButton />
);

export default DropzoneRemoveComponent;

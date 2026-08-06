import type { Dispatch, SetStateAction } from "react";
import type { Editor } from "@tiptap/core";
import type { Node as WireNode } from "@lattice-php/core/types";
import { translate, useT } from "@lattice-php/ui/i18n";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/ui/dialog";
import { LibraryView, type MediaRow } from "../components/library-view";

/**
 * The picker dialog body for the media-image toolbar control, split out of
 * media-image.tsx so it (and the media-library grid stack it pulls in) loads
 * lazily instead of riding in the eager editor-extension bundle.
 */
export default function MediaImageDialog({
  editor,
  library,
  setOpen,
}: {
  editor: Editor;
  library: WireNode;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useT("media");

  return (
    <Dialog onOpenChange={setOpen} open>
      <DialogContent
        aria-describedby={undefined}
        className="flex flex-col gap-5"
        data-test="editor-media-image-dialog"
        width="3xl"
      >
        <DialogHeader
          closeLabel={translate("lattice", "common.close", "Close")}
          title={t("media.picker.heading", "Choose media")}
        />
        <LibraryView
          node={library}
          pick={{
            multiple: true,
            onConfirm: (items: MediaRow[]) => {
              editor
                .chain()
                .focus()
                .insertContent(
                  items.map((item) => ({
                    type: "mediaImage",
                    attrs: { id: item.id, url: item.url, mediaAlt: item.alt },
                  })),
                )
                .run();
              setOpen(false);
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

import { Button } from "@lattice-php/ui/components/button/button";
import { useT } from "@lattice-php/ui/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@lattice-php/ui/primitives/dialog";
import { Spinner } from "@lattice-php/ui/primitives/spinner";

/**
 * Shown when a save hits a newer server revision. Reloading discards the local
 * draft in favour of the server's; overwriting saves the local draft over it.
 * Dismissing is not an option: the editor cannot keep autosaving until the
 * user picks one.
 */
export function ConflictDialog({
  open,
  overwriting,
  onReload,
  onOverwrite,
}: {
  open: boolean;
  overwriting: boolean;
  onReload: () => void;
  onOverwrite: () => void;
}) {
  const { t } = useT("blocks");

  return (
    <Dialog open={open}>
      <DialogContent
        width="md"
        data-test="blocks-conflict-dialog"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <div className="grid gap-2">
          <DialogTitle>
            {t("blocks.editor.conflict-dialog.title", "This page was changed elsewhere")}
          </DialogTitle>
          <DialogDescription>
            {t(
              "blocks.editor.conflict-dialog.description",
              "Someone else saved a newer draft. Reload to see their version, or overwrite it with yours.",
            )}
          </DialogDescription>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            emphasis="outline"
            data-test="blocks-conflict-reload"
            disabled={overwriting}
            onClick={onReload}
          >
            {t("blocks.editor.conflict-dialog.reload", "Reload")}
          </Button>
          <Button
            type="button"
            variant="danger"
            data-test="blocks-conflict-overwrite"
            disabled={overwriting}
            onClick={onOverwrite}
          >
            {overwriting && <Spinner />}
            {t("blocks.editor.conflict-dialog.overwrite", "Overwrite")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

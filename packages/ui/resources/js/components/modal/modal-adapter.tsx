import { Dialog, DialogContent, DialogHeader } from "../../primitives/dialog";
import type { RendererComponent } from "@lattice-php/core/types";
import { UI_NAMESPACE, useT } from "../../i18n";
import { useEmbeddedModal } from "../../modal-host";

let warnedMissingHost = false;

function warnMissingHost(): void {
  if (!import.meta.env.DEV || warnedMissingHost) {
    return;
  }

  warnedMissingHost = true;
  console.warn(
    "[Lattice] Modal nodes render only through a trigger's ->modal() or an openModal effect; wrap the app in a ModalHostProvider.",
  );
}

const ModalAdapter: RendererComponent<"modal"> = ({ children, node }) => {
  const { t } = useT(UI_NAMESPACE);
  const context = useEmbeddedModal();

  if (!context) {
    warnMissingHost();

    return null;
  }

  const title = node.props.title ?? t("common.dialog", "Dialog");
  const description = node.props.description;
  const closeLabel = node.props.closeLabel;

  return (
    <Dialog open={context.open} onOpenChange={context.onOpenChange}>
      <DialogContent
        {...(description ? {} : { "aria-describedby": undefined })}
        onCloseAutoFocus={context.onExited}
        placement={node.props.side ?? "center"}
        width={node.props.width}
        height={node.props.height}
      >
        <DialogHeader closeLabel={closeLabel} description={description} title={title} />
        <div className="mt-6 space-y-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalAdapter;

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/lattice/core/components/dialog";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";

type ModalEvent = CustomEvent<{
  modal: string | null;
}>;

function matchesModal(event: Event, modal: string): boolean {
  const target = (event as ModalEvent).detail?.modal;

  return target == null || target === modal;
}

const ModalComponent: RendererComponent<"modal"> = ({ children, node }) => {
  const title = node.props.title ?? "Dialog";
  const description = node.props.description;
  const closeLabel = node.props.closeLabel;
  const [isOpen, setIsOpen] = useState(node.props.open === true);

  // Honour server-driven open changes across re-renders, not just on mount. One
  // way on purpose: closing stays user/closeModal-driven so it never fights a
  // manual close, and the dep keeps it from re-firing while open stays true.
  useEffect(() => {
    if (node.props.open === true) {
      setIsOpen(true);
    }
  }, [node.props.open]);

  useEffect(() => {
    function open(event: Event): void {
      if (node.id && matchesModal(event, node.id)) {
        setIsOpen(true);
      }
    }

    function close(event: Event): void {
      if (!node.id || matchesModal(event, node.id)) {
        setIsOpen(false);
      }
    }

    window.addEventListener(LATTICE_EVENT.openModal, open);
    window.addEventListener(LATTICE_EVENT.closeModal, close);

    return () => {
      window.removeEventListener(LATTICE_EVENT.openModal, open);
      window.removeEventListener(LATTICE_EVENT.closeModal, close);
    };
  }, [node.id]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        {...(description ? {} : { "aria-describedby": undefined })}
        className="max-h-[min(680px,calc(100vh-2rem))] w-full max-w-lg overflow-y-auto"
      >
        <DialogHeader closeLabel={closeLabel} description={description} title={title} />
        <div className="mt-6 space-y-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalComponent;

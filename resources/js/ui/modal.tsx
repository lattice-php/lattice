import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/lattice/ui/dialog";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";

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
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(isOpen);

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
        openerRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
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

  // Radix only restores focus to a `DialogTrigger`-registered element, and this
  // modal is opened imperatively rather than through one. Own the restore
  // ourselves instead: whatever had focus when the modal opened gets it back
  // once the closing dialog has finished unmounting.
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      const opener = openerRef.current;

      if (opener) {
        requestAnimationFrame(() => opener.focus());
      }
    }

    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        {...(description ? {} : { "aria-describedby": undefined })}
        placement={node.props.side ?? "center"}
        width={node.props.width}
      >
        <DialogHeader closeLabel={closeLabel} description={description} title={title} />
        <div className="mt-6 space-y-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalComponent;

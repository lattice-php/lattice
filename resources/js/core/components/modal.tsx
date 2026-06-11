import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@lattice/lattice/core/components/button";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { LATTICE_EVENT } from "@lattice/lattice/events/event-names";

type ModalEvent = CustomEvent<{
  modal?: string;
}>;

function matchesModal(event: Event, modal: string): boolean {
  const target = (event as ModalEvent).detail?.modal;

  return target === undefined || target === modal;
}

const ModalComponent: RendererComponent<"modal"> = ({ children, node }) => {
  const title = node.props.title ?? "Dialog";
  const description = node.props.description;
  const closeLabel = node.props.closeLabel ?? "Close";
  const [isOpen, setIsOpen] = useState(node.props.open === true);

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
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          {...(description ? {} : { "aria-describedby": undefined })}
          className="fixed left-1/2 top-1/2 z-50 max-h-[min(680px,calc(100vh-2rem))] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lt border border-lt-border bg-lt-bg p-6 shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-2">
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </Dialog.Title>

              {description && (
                <Dialog.Description className="text-sm text-lt-muted-fg">
                  {description}
                </Dialog.Description>
              )}
            </div>

            <Dialog.Close asChild>
              <Button aria-label={closeLabel} size="icon" variant="ghost">
                <X aria-hidden="true" className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="mt-6 space-y-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ModalComponent;

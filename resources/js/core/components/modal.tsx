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
  const titleId = `${node.id ?? node.key ?? "lattice-modal"}-title`;
  const descriptionId = `${node.id ?? node.key ?? "lattice-modal"}-description`;

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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[min(680px,calc(100vh-2rem))] w-full max-w-lg overflow-y-auto rounded-lt border border-lt-border bg-lt-bg p-6 shadow-lg"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            <h2 className="text-lg font-semibold leading-none tracking-tight" id={titleId}>
              {title}
            </h2>

            {description && (
              <p className="text-sm text-lt-muted-fg" id={descriptionId}>
                {description}
              </p>
            )}
          </div>

          <Button
            aria-label={closeLabel}
            onClick={() => setIsOpen(false)}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ModalComponent;

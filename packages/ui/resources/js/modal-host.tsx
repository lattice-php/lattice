import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Node } from "@lattice-php/core/types";
import { RenderNode } from "@lattice-php/core/renderer";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";

export const MODAL_HOST_MISSING_ERROR = "Embedded modals require a ModalHostProvider.";

export type EmbeddedModalState = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EmbeddedModalContext = createContext<EmbeddedModalState | null>(null);

export function useEmbeddedModal(): EmbeddedModalState | null {
  return useContext(EmbeddedModalContext);
}

export type ModalHost = {
  open: (node: Node<"modal">) => void;
};

export const ModalHostContext = createContext<ModalHost | null>(null);

export function useModalHost(): ModalHost {
  const host = useContext(ModalHostContext);

  if (!host) {
    throw new Error(MODAL_HOST_MISSING_ERROR);
  }

  return host;
}

type OpenModalEvent = CustomEvent<{ node?: Node<"modal"> }>;
type CloseModalEvent = CustomEvent<{ modal?: string | null }>;

export function ModalHostProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<Node<"modal"> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(isOpen);

  const open = useCallback((next: Node<"modal">) => {
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setNode(next);
    setIsOpen(true);
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    setIsOpen(next);
  }, []);

  // Radix only restores focus to a `DialogTrigger`-registered element, and these
  // modals are opened imperatively rather than through one. Own the restore
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

  useEffect(() => {
    function handleOpen(event: Event): void {
      const target = (event as OpenModalEvent).detail?.node;

      if (target) {
        open(target);
      }
    }

    function handleClose(event: Event): void {
      const target = (event as CloseModalEvent).detail?.modal;

      if (target == null || target === node?.id) {
        setIsOpen(false);
      }
    }

    window.addEventListener(LATTICE_EVENT.openModal, handleOpen);
    window.addEventListener(LATTICE_EVENT.closeModal, handleClose);

    return () => {
      window.removeEventListener(LATTICE_EVENT.openModal, handleOpen);
      window.removeEventListener(LATTICE_EVENT.closeModal, handleClose);
    };
  }, [open, node?.id]);

  const host = useMemo(() => ({ open }), [open]);
  const embedded = useMemo(() => ({ open: isOpen, onOpenChange }), [isOpen, onOpenChange]);

  return (
    <ModalHostContext.Provider value={host}>
      {children}
      {node !== null ? (
        <EmbeddedModalContext.Provider value={embedded}>
          <RenderNode node={node} />
        </EmbeddedModalContext.Provider>
      ) : null}
    </ModalHostContext.Provider>
  );
}

import {
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";
import type { Node } from "@lattice-php/core/types";
import { RenderNode } from "@lattice-php/core/renderer";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";

export const MODAL_HOST_MISSING_ERROR = "Embedded modals require a ModalHostProvider.";

/**
 * Contract: any dialog shell consuming this context (`modal.tsx`, a
 * controlled `ConfirmDialog`, ...) MUST wire `onExited` to its Radix
 * `DialogContent`'s `onCloseAutoFocus`. `onOpenChange(false)` only starts
 * the close — Radix plays the exit animation while the entry stays mounted
 * with `open: false` — and the host removes the entry (and restores focus)
 * only once `onExited` fires. A shell that never wires `onExited` leaves its
 * entry mounted-but-closed forever; this is the same silent leak the old
 * single-slot host had if a caller skipped `onOpenChange`, so there is
 * deliberately no backstop timer here.
 */
export type EmbeddedModalState = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExited: (event: Event) => void;
};

export const EmbeddedModalContext = createContext<EmbeddedModalState | null>(null);

export function useEmbeddedModal(): EmbeddedModalState | null {
  return useContext(EmbeddedModalContext);
}

export type ModalHost = {
  open: (content: Node<"modal"> | ReactElement) => void;
};

export const ModalHostContext = createContext<ModalHost | null>(null);

export function useModalHost(): ModalHost {
  const host = useContext(ModalHostContext);

  if (!host) {
    throw new Error(MODAL_HOST_MISSING_ERROR);
  }

  return host;
}

type ModalHostEntry = {
  key: number;
  content: Node<"modal"> | ReactElement;
  nodeId: string | null;
  open: boolean;
  opener: HTMLElement | null;
};

type ModalHostClosures = {
  onOpenChange: (open: boolean) => void;
  onExited: (event: Event) => void;
};

type OpenModalEvent = CustomEvent<{ node?: Node<"modal"> }>;
type CloseModalEvent = CustomEvent<{ modal?: string | null }>;

function topmostOpenIndex(stack: ModalHostEntry[]): number {
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    if (stack[index].open) {
      return index;
    }
  }

  return -1;
}

export function ModalHostProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<ModalHostEntry[]>([]);
  const nextKeyRef = useRef(0);
  const closuresRef = useRef(new Map<number, ModalHostClosures>());

  const open = useCallback((content: Node<"modal"> | ReactElement) => {
    const nodeId = isValidElement(content) ? null : (content.id ?? null);
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    setStack((current) => {
      if (nodeId !== null) {
        const index = current.findIndex((entry) => entry.nodeId === nodeId && entry.open);

        if (index !== -1) {
          const next = [...current];
          next[index] = { ...next[index], content };

          return next;
        }
      }

      return [...current, { key: nextKeyRef.current++, content, nodeId, open: true, opener }];
    });
  }, []);

  useEffect(() => {
    function handleOpen(event: Event): void {
      const target = (event as OpenModalEvent).detail?.node;

      if (target) {
        open(target);
      }
    }

    function handleClose(event: Event): void {
      const target = (event as CloseModalEvent).detail?.modal;

      setStack((current) => {
        const index =
          target == null
            ? topmostOpenIndex(current)
            : current.findIndex((entry) => entry.nodeId === target);

        if (index === -1) {
          return current;
        }

        const next = [...current];
        next[index] = { ...next[index], open: false };

        return next;
      });
    }

    window.addEventListener(LATTICE_EVENT.openModal, handleOpen);
    window.addEventListener(LATTICE_EVENT.closeModal, handleClose);

    return () => {
      window.removeEventListener(LATTICE_EVENT.openModal, handleOpen);
      window.removeEventListener(LATTICE_EVENT.closeModal, handleClose);
    };
  }, [open]);

  const closuresFor = useCallback((key: number): ModalHostClosures => {
    let closures = closuresRef.current.get(key);

    if (closures) {
      return closures;
    }

    closures = {
      onOpenChange: (nextOpen) => {
        if (nextOpen) {
          return;
        }

        setStack((current) =>
          current.map((entry) => (entry.key === key ? { ...entry, open: false } : entry)),
        );
      },
      // Radix only restores focus to a `DialogTrigger`-registered element, and
      // these modals are opened imperatively rather than through one. Own the
      // restore ourselves instead: whatever had focus when the entry opened
      // gets it back once the closing dialog has finished its exit animation.
      // The opener can itself have unmounted in the meantime (e.g. a popover
      // menu item that also closed) — fall back to Radix's default in that case.
      onExited: (event) => {
        setStack((current) => {
          const entry = current.find((candidate) => candidate.key === key);
          const opener = entry?.opener ?? null;

          if (opener?.isConnected) {
            event.preventDefault();
            requestAnimationFrame(() => opener.focus());
          }

          return current.filter((candidate) => candidate.key !== key);
        });

        closuresRef.current.delete(key);
      },
    };

    closuresRef.current.set(key, closures);

    return closures;
  }, []);

  const host = useMemo(() => ({ open }), [open]);

  return (
    <ModalHostContext.Provider value={host}>
      {children}
      {stack.map((entry) => {
        const value: EmbeddedModalState = { open: entry.open, ...closuresFor(entry.key) };

        return (
          <EmbeddedModalContext.Provider key={entry.key} value={value}>
            {isValidElement(entry.content) ? entry.content : <RenderNode node={entry.content} />}
          </EmbeddedModalContext.Provider>
        );
      })}
    </ModalHostContext.Provider>
  );
}

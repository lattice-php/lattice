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

export const MODAL_MISSING_ERROR = "Embedded modals require a ModalProvider.";

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

const EmbeddedModalContext = createContext<EmbeddedModalState | null>(null);

export function EmbeddedModalProvider({
  state,
  children,
}: {
  state: EmbeddedModalState;
  children: ReactNode;
}) {
  return <EmbeddedModalContext.Provider value={state}>{children}</EmbeddedModalContext.Provider>;
}

export function useEmbeddedModal(): EmbeddedModalState | null {
  return useContext(EmbeddedModalContext);
}

export type ModalHandle = {
  close: () => void;
};

export type ModalApi = {
  open: (content: Node<"modal"> | ReactElement) => ModalHandle;
};

const ModalContext = createContext<ModalApi | null>(null);

export function useOptionalModal(): ModalApi | null {
  return useContext(ModalContext);
}

export function useModal(): ModalApi {
  const host = useOptionalModal();

  if (!host) {
    throw new Error(MODAL_MISSING_ERROR);
  }

  return host;
}

type ModalEntry = {
  key: number;
  content: Node<"modal"> | ReactElement;
  nodeId: string | null;
  open: boolean;
  opener: HTMLElement | null;
};

type ModalClosures = {
  onOpenChange: (open: boolean) => void;
  onExited: (event: Event) => void;
};

type OpenModalEvent = CustomEvent<{ node?: Node<"modal"> }>;
type CloseModalEvent = CustomEvent<{ modal?: string | null }>;

export function ModalProvider({ children }: { children: ReactNode }) {
  const [stack, setStackState] = useState<ModalEntry[]>([]);
  const stackRef = useRef<ModalEntry[]>(stack);
  const nextKeyRef = useRef(0);
  const closuresRef = useRef(new Map<number, ModalClosures>());

  // Runs the updater synchronously against `stackRef` rather than through
  // React's `setState` updater queue, so callers (like `open`) can read the
  // resulting entry back out in the same tick to build its close handle.
  const updateStack = useCallback(
    (updater: (current: ModalEntry[]) => ModalEntry[]): ModalEntry[] => {
      const next = updater(stackRef.current);
      stackRef.current = next;
      setStackState(next);

      return next;
    },
    [],
  );

  const closeEntry = useCallback(
    (key: number) => {
      updateStack((current) => {
        const index = current.findIndex((entry) => entry.key === key);

        if (index === -1 || !current[index].open) {
          return current;
        }

        const next = [...current];
        next[index] = { ...next[index], open: false };

        return next;
      });
    },
    [updateStack],
  );

  const open = useCallback(
    (content: Node<"modal"> | ReactElement): ModalHandle => {
      const nodeId = isValidElement(content) ? null : (content.id ?? null);
      const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      let key = -1;

      updateStack((current) => {
        if (nodeId !== null) {
          const index = current.findIndex((entry) => entry.nodeId === nodeId && entry.open);

          if (index !== -1) {
            key = current[index].key;
            const next = [...current];
            next[index] = { ...next[index], content };

            return next;
          }
        }

        key = nextKeyRef.current++;

        return [...current, { key, content, nodeId, open: true, opener }];
      });

      return { close: () => closeEntry(key) };
    },
    [closeEntry, updateStack],
  );

  useEffect(() => {
    function handleOpen(event: Event): void {
      const target = (event as OpenModalEvent).detail?.node;

      if (target) {
        open(target);
      }
    }

    function handleClose(event: Event): void {
      const target = (event as CloseModalEvent).detail?.modal;

      updateStack((current) => {
        if (target == null) {
          return current.map((entry) => (entry.open ? { ...entry, open: false } : entry));
        }

        const index = current.findIndex((entry) => entry.nodeId === target);

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
  }, [open, updateStack]);

  const closuresFor = useCallback(
    (key: number): ModalClosures => {
      let closures = closuresRef.current.get(key);

      if (closures) {
        return closures;
      }

      closures = {
        onOpenChange: (nextOpen) => {
          if (nextOpen) {
            return;
          }

          closeEntry(key);
        },
        // Radix only restores focus to a `DialogTrigger`-registered element, and
        // these modals are opened imperatively rather than through one. Own the
        // restore ourselves instead: whatever had focus when the entry opened
        // gets it back once the closing dialog has finished its exit animation.
        // The opener can itself have unmounted in the meantime (e.g. a popover
        // menu item that also closed) — fall back to Radix's default in that case.
        onExited: (event) => {
          updateStack((current) => {
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
    },
    [closeEntry, updateStack],
  );

  const host = useMemo(() => ({ open }), [open]);

  return (
    <ModalContext.Provider value={host}>
      {children}
      {stack.map((entry) => {
        const value: EmbeddedModalState = { open: entry.open, ...closuresFor(entry.key) };

        return (
          <EmbeddedModalContext.Provider key={entry.key} value={value}>
            {isValidElement(entry.content) ? entry.content : <RenderNode node={entry.content} />}
          </EmbeddedModalContext.Provider>
        );
      })}
    </ModalContext.Provider>
  );
}

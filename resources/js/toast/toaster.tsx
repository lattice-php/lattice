import * as Toast from "@radix-ui/react-toast";
import { CircleAlert, CircleCheck, CircleX, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Renderer } from "@lattice/lattice/core/renderer";
import type { Node } from "@lattice/lattice/core/types";
import { LATTICE_EVENT } from "@lattice/lattice/events/event-names";
import { cn } from "@lattice/lattice/lib/utils";
import { useRegistry } from "@lattice/lattice/provider";

const variants = ["success", "info", "warning", "error"] as const;

type ToastVariant = (typeof variants)[number];

type ToastItem = {
  action?: Node;
  dismissible: boolean;
  duration?: number | null;
  id: number;
  message: string;
  persistent: boolean;
  variant: ToastVariant;
};

const variantIcon: Record<ToastVariant, ReactNode> = {
  success: <CircleCheck className="size-5 shrink-0 text-emerald-500" />,
  info: <Info className="size-5 shrink-0 text-sky-500" />,
  warning: <CircleAlert className="size-5 shrink-0 text-amber-500" />,
  error: <CircleX className="size-5 shrink-0 text-lt-danger" />,
};

function isVariant(value: unknown): value is ToastVariant {
  return variants.some((variant) => variant === value);
}

let nextId = 0;

function normalize(detail: unknown): Omit<ToastItem, "id"> | null {
  if (typeof detail !== "object" || detail === null) {
    return null;
  }

  const data = detail as Record<string, unknown>;

  if (typeof data.message !== "string" || data.message === "") {
    return null;
  }

  return {
    action: (data.action as Node | undefined) ?? undefined,
    dismissible: data.dismissible !== false,
    duration: typeof data.duration === "number" ? data.duration : null,
    message: data.message,
    persistent: data.persistent === true,
    variant: isVariant(data.variant) ? data.variant : "success",
  };
}

export function Toaster({ duration = 4000 }: { duration?: number }) {
  const registry = useRegistry();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function push(detail: unknown): void {
    const item = normalize(detail);

    if (item) {
      setToasts((current) => [...current, { ...item, id: nextId++ }]);
    }
  }

  function dismiss(id: number): void {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  useEffect(() => {
    const listener = (event: Event): void => push((event as CustomEvent).detail);

    window.addEventListener(LATTICE_EVENT.toast, listener);

    return () => window.removeEventListener(LATTICE_EVENT.toast, listener);
  }, []);

  return (
    <Toast.Provider duration={duration} swipeDirection="down">
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-lt border border-lt-border bg-lt-popover p-4 text-lt-popover-fg shadow-lg",
            "data-[state=open]:animate-lt-toast-in data-[state=closed]:animate-lt-toast-out",
            "data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-transform",
          )}
          data-test={`toast-${toast.variant}`}
          duration={toast.persistent ? Infinity : (toast.duration ?? duration)}
          onOpenChange={(open) => {
            if (!open) {
              dismiss(toast.id);
            }
          }}
        >
          {variantIcon[toast.variant]}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Toast.Title className="text-sm text-lt-fg">{toast.message}</Toast.Title>
            {toast.action ? (
              <div className="flex flex-wrap gap-2">
                <Renderer nodes={[toast.action]} registry={registry} />
              </div>
            ) : null}
          </div>
          {toast.dismissible ? (
            <Toast.Close
              aria-label="Dismiss"
              className="shrink-0 rounded-md p-1 text-lt-muted-fg transition-colors hover:bg-lt-muted hover:text-lt-fg"
              data-test="toast-dismiss"
            >
              <X className="size-4" />
            </Toast.Close>
          ) : null}
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed inset-x-0 bottom-0 z-[100] mx-auto flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
    </Toast.Provider>
  );
}

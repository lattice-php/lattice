import { Icon } from "@lattice-php/lattice/icons";
import * as Toast from "@radix-ui/react-toast";
import { useEffect, useState } from "react";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import type { ToastMessage } from "@lattice-php/lattice/types/generated";
import { onToast } from "@lattice-php/lattice/toast/toast";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import { useRegistry } from "@lattice-php/lattice/provider";
import { variantStyles } from "@lattice-php/lattice/toast/variant-styles";

type ToastItem = ToastMessage & { id: number };

let nextId = 0;

export function Toaster({ duration = 4000 }: { duration?: number }) {
  const { t } = useT("lattice");
  const registry = useRegistry();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function dismiss(id: number): void {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  useEffect(
    () =>
      onToast((toast) => {
        setToasts((current) => [...current, { ...toast, id: nextId++ }]);
      }),
    [],
  );

  return (
    <Toast.Provider duration={duration} swipeDirection="down">
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-lt border border-l-4 border-lt-border bg-lt-popover p-4 text-lt-popover-fg shadow-lg",
            variantStyles[toast.variant].accent,
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
          {variantStyles[toast.variant].icon}
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
              aria-label={t("a11y.dismiss", "Dismiss")}
              className="shrink-0 rounded-md p-1 text-lt-muted-fg transition-colors hover:bg-lt-muted hover:text-lt-fg"
              data-test="toast-dismiss"
            >
              <Icon name="x" className="size-lt-icon-md" />
            </Toast.Close>
          ) : null}
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed inset-x-0 bottom-0 z-[100] mx-auto flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
    </Toast.Provider>
  );
}

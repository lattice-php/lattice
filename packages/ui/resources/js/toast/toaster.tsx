import * as ToastPrimitive from "@radix-ui/react-toast";
import { useEffect, useState } from "react";
import { RenderNode } from "@lattice-php/core/renderer";
import { UI_NAMESPACE, useT } from "../i18n";
import { resolveText } from "../i18n/translatable";
import { onToast, type ToastMessage } from "./bus";
import { Toast } from "./toast";

type ToastItem = ToastMessage & { id: number };

let nextId = 0;

export function Toaster({ duration = 4000 }: { duration?: number }) {
  const { t } = useT(UI_NAMESPACE);
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
    <ToastPrimitive.Provider duration={duration} swipeDirection="down">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          action={toast.action ? <RenderNode node={toast.action} /> : undefined}
          dismissLabel={t("common.dismiss", "Dismiss")}
          dismissible={toast.dismissible}
          duration={toast.duration ?? duration}
          message={resolveText(toast.message, t)}
          onOpenChange={(open) => {
            if (!open) {
              dismiss(toast.id);
            }
          }}
          persistent={toast.persistent}
          variant={toast.variant}
        />
      ))}
      <ToastPrimitive.Viewport className="fixed inset-x-0 bottom-0 z-lt-toast mx-auto flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
    </ToastPrimitive.Provider>
  );
}

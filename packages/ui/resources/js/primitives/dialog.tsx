import { Icon } from "../icons";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cva } from "class-variance-authority";
import { Button } from "../components/button/button";
import { cn } from "../lib/utils";
import type { ModalHeight, ModalWidth, Side } from "../types";

export type DialogPlacement = "center" | Side;

const dialogContentVariants = cva(
  "fixed z-lt-modal w-full overflow-y-auto bg-lt-bg p-6 shadow-lt-lg",
  {
    variants: {
      placement: {
        center:
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lt border border-lt-border data-[state=open]:animate-lt-dialog-in data-[state=closed]:animate-lt-dialog-out",
        start:
          "inset-y-0 start-0 border-e border-lt-border data-[state=open]:animate-lt-sheet-in-start data-[state=closed]:animate-lt-sheet-out-start",
        end: "inset-y-0 end-0 border-s border-lt-border data-[state=open]:animate-lt-sheet-in-end data-[state=closed]:animate-lt-sheet-out-end",
      },
      width: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
        "6xl": "max-w-6xl",
        "7xl": "max-w-7xl",
        max: "max-w-[calc(100vw-2rem)]",
      } satisfies Record<ModalWidth, string>,
      height: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
        "2xl": "",
        "3xl": "",
        "4xl": "",
        "5xl": "",
        max: "",
      } satisfies Record<ModalHeight, string>,
    },
    compoundVariants: [
      { placement: "center", height: "sm", class: "max-h-[min(480px,calc(100vh-2rem))]" },
      { placement: "center", height: "md", class: "max-h-[min(600px,calc(100vh-2rem))]" },
      { placement: "center", height: "lg", class: "max-h-[min(680px,calc(100vh-2rem))]" },
      { placement: "center", height: "xl", class: "max-h-[min(820px,calc(100vh-2rem))]" },
      { placement: "center", height: "2xl", class: "max-h-[min(920px,calc(100vh-2rem))]" },
      { placement: "center", height: "3xl", class: "max-h-[min(1040px,calc(100vh-2rem))]" },
      { placement: "center", height: "4xl", class: "max-h-[min(1160px,calc(100vh-2rem))]" },
      { placement: "center", height: "5xl", class: "max-h-[min(1280px,calc(100vh-2rem))]" },
      {
        placement: "center",
        height: "max",
        class: "h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)]",
      },
    ],
    defaultVariants: { placement: "center", width: "lg", height: "lg" },
  },
);

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-lt-muted-fg", className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}

function DialogContent({
  children,
  className,
  placement = "center",
  width = "lg",
  height = "lg",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  placement?: DialogPlacement;
  width?: ModalWidth;
  height?: ModalHeight;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-lt-overlay bg-lt-overlay data-[state=open]:animate-lt-fade-in data-[state=closed]:animate-lt-fade-out"
        data-slot="dialog-overlay"
      />
      <DialogPrimitive.Content
        className={cn(dialogContentVariants({ placement, width, height }), className)}
        data-slot="dialog-content"
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/**
 * The shared dialog header: a title with an optional description and a ghost
 * close button. Pass `description` as `undefined` to suppress the description
 * and the matching `aria-describedby` wiring on the content.
 */
function DialogHeader({
  closeLabel,
  description,
  title,
}: {
  closeLabel?: string;
  description?: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="grid gap-2">
        <DialogTitle>{title}</DialogTitle>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
      </div>
      <DialogClose asChild>
        <Button aria-label={closeLabel} data-test="dialog-close" size="icon" emphasis="ghost">
          <Icon name="x" aria-hidden="true" className="size-lt-icon-md" />
        </Button>
      </DialogClose>
    </div>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};

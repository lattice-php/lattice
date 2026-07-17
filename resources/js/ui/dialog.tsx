import { Icon } from "@lattice-php/lattice/icons";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cva } from "class-variance-authority";
import { Button } from "@lattice-php/lattice/ui/button";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { ModalWidth, Side } from "@lattice-php/lattice/types/generated";

export type DialogPlacement = "center" | Side;

const dialogContentVariants = cva(
  "fixed z-lt-modal w-full overflow-y-auto bg-lt-bg p-6 shadow-lt-lg",
  {
    variants: {
      placement: {
        center:
          "left-1/2 top-1/2 max-h-[min(680px,calc(100vh-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lt border border-lt-border data-[state=open]:animate-lt-dialog-in data-[state=closed]:animate-lt-dialog-out",
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
      },
    },
    defaultVariants: { placement: "center", width: "lg" },
  },
);

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
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
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  placement?: DialogPlacement;
  width?: ModalWidth;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-lt-overlay bg-lt-overlay data-[state=open]:animate-lt-fade-in data-[state=closed]:animate-lt-fade-out"
        data-slot="dialog-overlay"
      />
      <DialogPrimitive.Content
        className={cn(dialogContentVariants({ placement, width }), className)}
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
        <Button aria-label={closeLabel} data-test="dialog-close" size="icon" variant="ghost">
          <Icon name="x" aria-hidden="true" className="size-lt-icon-md" />
        </Button>
      </DialogClose>
    </div>
  );
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle };

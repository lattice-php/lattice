import { Icon } from "@lattice-php/lattice/icons";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { Button } from "@lattice-php/lattice/core/components/button";
import { cn } from "@lattice-php/lattice/lib/utils";

export const DIALOG_SURFACE =
  "fixed left-1/2 top-1/2 z-lt-modal -translate-x-1/2 -translate-y-1/2 rounded-lt border border-lt-border bg-lt-bg p-6 shadow-lt-lg";

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
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-lt-overlay bg-lt-overlay"
        data-slot="dialog-overlay"
      />
      <DialogPrimitive.Content
        className={cn(DIALOG_SURFACE, className)}
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

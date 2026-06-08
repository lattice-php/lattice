import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  CircleHelp,
  Copy,
  ExternalLink,
  EyeOff,
  LayoutDashboard,
  Link,
  MoreHorizontal,
  Pencil,
  PencilLine,
  Send,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@lattice/lib/utils";
import type { IconRendererProps } from "@lattice";

const bundledIcons = {
  "arrow-down": ArrowDown,
  "arrow-up": ArrowUp,
  check: Check,
  "chevrons-up-down": ChevronsUpDown,
  copy: Copy,
  delete: Trash2,
  edit: PencilLine,
  "external-link": ExternalLink,
  "eye-off": EyeOff,
  "layout-dashboard": LayoutDashboard,
  link: Link,
  "more-horizontal": MoreHorizontal,
  pencil: Pencil,
  "pencil-line": PencilLine,
  send: Send,
  settings: Settings,
  trash: Trash2,
  "trash-2": Trash2,
  x: X,
};

export function renderBundledIcon({ className, icon }: IconRendererProps) {
  const Icon = bundledIcons[icon as keyof typeof bundledIcons];

  if (!Icon) {
    return null;
  }

  return <Icon aria-hidden="true" className={cn("size-4", className)} />;
}

export function renderMissingIcon({ className }: IconRendererProps) {
  return (
    <CircleHelp
      aria-hidden="true"
      className={cn("size-4 text-lt-muted-fg", className)}
      data-lattice-missing-icon=""
    />
  );
}

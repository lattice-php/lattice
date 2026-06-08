import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { getStringProp } from "@/lattice/core/props";
import type { LatticeRendererComponent } from "@/lattice/core/types";

declare module "@/lattice/core/types" {
  interface LatticeComponentProps {
    "action.group": {
      label?: string;
    };
  }
}

const ActionGroupComponent: LatticeRendererComponent<"action.group"> = ({ children, node }) => {
  const label = getStringProp(node.props, "label", "Actions");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ right: number; top: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setPosition({
      right: Math.max(8, window.innerWidth - rect.right),
      top: rect.bottom + 8,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();

    const closeWhenOutside = (event: MouseEvent): void => {
      const target = event.target;

      if (
        target instanceof Node &&
        (buttonRef.current?.contains(target) || menuRef.current?.contains(target))
      ) {
        return;
      }

      setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", closeWhenOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", closeWhenOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, updatePosition]);

  const toggle = (): void => {
    updatePosition();
    setOpen((current) => !current);
  };

  const menu =
    open && position && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            aria-label={label}
            className="fixed z-50 grid min-w-40 gap-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md [&>button]:w-full [&>button]:justify-start"
            role="menu"
            style={position}
          >
            {children}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="inline-flex" data-lattice-component={node.id}>
      <Button
        ref={buttonRef}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        className="size-8 text-muted-foreground shadow-none hover:text-foreground"
        onClick={toggle}
        size="icon"
        type="button"
        variant="ghost"
      >
        <MoreHorizontal aria-hidden="true" className="size-4" />
      </Button>

      {menu}
    </div>
  );
};

export default ActionGroupComponent;

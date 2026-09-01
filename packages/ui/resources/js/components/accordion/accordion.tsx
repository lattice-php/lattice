import { createContext, useContext, useMemo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/utils";
import type { Gap } from "../../generated";
import { stackGaps } from "../stack/stack";

type AccordionContextValue = {
  items: readonly string[];
  openItem: string | null;
  setOpenItem: (item: string | null) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

export type AccordionProps = Omit<ComponentProps<"div">, "children"> & {
  children?: ReactNode;
  defaultOpen?: string | null;
  gap?: Gap;
  items: readonly string[];
};

export function Accordion({
  children,
  className,
  defaultOpen = null,
  gap,
  items,
  ...props
}: AccordionProps) {
  const [openItem, setOpenItem] = useState(defaultOpen);
  const [previousDefaultOpen, setPreviousDefaultOpen] = useState(defaultOpen);

  if (defaultOpen !== previousDefaultOpen) {
    setPreviousDefaultOpen(defaultOpen);
    setOpenItem(defaultOpen);
  }

  const value = useMemo(() => ({ items, openItem, setOpenItem }), [items, openItem]);

  return (
    <div
      data-slot="accordion"
      className={cn("flex flex-col", gap ? stackGaps[gap] : null, className)}
      {...props}
    >
      <AccordionContext.Provider value={value}>{children}</AccordionContext.Provider>
    </div>
  );
}

/**
 * Controlled open state for one accordion item, or `null` when the caller is
 * not one: outside any accordion, without an identity, or an identity that is
 * not among the accordion's direct children — so collapsibles nested inside an
 * item's content keep their own local state.
 */
export function useAccordionItem(
  item: string | undefined,
): { open: boolean; setOpen: (open: boolean) => void } | null {
  const context = useContext(AccordionContext);

  if (context === null || item === undefined || !context.items.includes(item)) {
    return null;
  }

  return {
    open: context.openItem === item,
    setOpen: (open) => context.setOpenItem(open ? item : null),
  };
}

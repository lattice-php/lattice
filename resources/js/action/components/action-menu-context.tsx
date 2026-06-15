import { createContext, useContext, type ReactNode } from "react";

const ActionMenuContext = createContext(false);

export const actionMenuItemClassName =
  "flex h-8 w-full items-center justify-start gap-2 rounded-lt-sm px-2.5 text-left text-sm font-normal text-lt-popover-fg no-underline decoration-transparent shadow-none transition-colors hover:bg-lt-accent/70 hover:text-lt-popover-fg focus-visible:bg-lt-accent/70 focus-visible:text-lt-popover-fg focus-visible:ring-0 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-lt-icon-sm [&_svg]:text-lt-muted-fg";

export function ActionMenuProvider({ children }: { children: ReactNode }) {
  return <ActionMenuContext.Provider value={true}>{children}</ActionMenuContext.Provider>;
}

export function useActionMenu(): boolean {
  return useContext(ActionMenuContext);
}

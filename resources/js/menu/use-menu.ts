import { usePage } from "@inertiajs/react";
import type { MenuPayload, PagePayload } from "@bambamboole/lattice/core/types";

export function useMenu(location: string): MenuPayload | null {
  const page = usePage();
  const lattice = page.props.lattice as PagePayload | undefined;

  return lattice?.menus[location] ?? null;
}

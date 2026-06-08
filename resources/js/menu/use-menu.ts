import { usePage } from "@inertiajs/react";
import type { LatticeMenuPayload, LatticePagePayload } from "@/lattice/core/types";

export function useMenu(location: string): LatticeMenuPayload | null {
  const page = usePage();
  const lattice = page.props.lattice as LatticePagePayload | undefined;

  return lattice?.menus[location] ?? null;
}

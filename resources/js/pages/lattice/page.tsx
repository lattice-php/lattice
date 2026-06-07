import { Head } from "@inertiajs/react";
import { latticeRegistry, LatticeRenderer } from "@/lattice";
import type { LatticePagePayload } from "@/types/lattice";

type Props = {
  lattice: LatticePagePayload;
};

export default function LatticePage({ lattice }: Props) {
  return (
    <>
      <Head title={lattice.title ?? undefined} />

      <main className="min-h-svh bg-background text-foreground">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10">
          <LatticeRenderer fallback={null} nodes={lattice.components} registry={latticeRegistry} />
        </div>
      </main>
    </>
  );
}

LatticePage.layout = null;

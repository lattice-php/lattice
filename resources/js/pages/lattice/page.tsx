import { Head } from "@inertiajs/react";
import { LatticeRenderer } from "@/lattice/core/renderer";
import { useLatticeRegistry } from "@/lattice/provider";
import type { PagePayload } from "@/types/lattice";
import { cn } from "@/lib/utils";

type Props = {
  lattice: PagePayload;
};

export default function LatticePage({ lattice }: Props) {
  const registry = useLatticeRegistry();
  const content = (
    <LatticeRenderer fallback={null} nodes={lattice.components} registry={registry} />
  );

  return (
    <>
      <Head title={lattice.title ?? undefined} />

      {lattice.container === "centered" ? (
        <main className="min-h-svh bg-lt-bg text-lt-fg">
          <div
            data-testid="lattice-centered-container"
            className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10"
          >
            {content}
          </div>
        </main>
      ) : (
        <div
          data-testid="lattice-default-container"
          className={cn("w-full", {
            "px-4 py-6": lattice.layout === "app",
          })}
        >
          {content}
        </div>
      )}
    </>
  );
}

import { Head } from "@inertiajs/react";
import { Renderer } from "@lattice-php/core/renderer";
import type { PagePayload } from "@lattice-php/lattice";
import { cn } from "@lattice-php/ui/lib/utils";
import { RealtimeListeners } from "@lattice-php/lattice/realtime/listeners";

type Props = {
  lattice: PagePayload;
};

const pageWidths: Record<string, string> = {
  full: "max-w-none",
  lg: "max-w-4xl",
  md: "max-w-2xl",
  sm: "max-w-md",
};

export default function Page({ lattice }: Props) {
  return (
    <>
      <Head title={lattice.title ?? undefined} />

      <RealtimeListeners listeners={lattice.listeners} />

      <div
        data-test="lattice-page-container"
        data-page-width={lattice.width}
        className={cn(
          "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8",
          pageWidths[lattice.width] ?? pageWidths.full,
        )}
      >
        <Renderer nodes={lattice.schema} />
      </div>
    </>
  );
}

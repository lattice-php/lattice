import { Head } from "@inertiajs/react";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import type { PagePayload } from "@lattice-php/lattice";
import { cn } from "@lattice-php/lattice/lib/utils";
import { RealtimeListeners } from "@lattice-php/lattice/realtime/listeners";

type Props = {
  lattice: PagePayload;
};

export default function Page({ lattice }: Props) {
  const content = <Renderer nodes={lattice.schema} />;

  return (
    <>
      <Head title={lattice.title ?? undefined} />

      <RealtimeListeners listeners={lattice.listeners} />

      {lattice.container === "centered" ? (
        <main className="min-h-svh bg-lt-bg text-lt-fg">
          <div
            data-test="lattice-centered-container"
            className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10"
          >
            {content}
          </div>
        </main>
      ) : (
        <div
          data-test="lattice-default-container"
          className={cn("w-full", {
            "px-4 py-6": lattice.layout !== null,
          })}
        >
          {content}
        </div>
      )}
    </>
  );
}

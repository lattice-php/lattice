import { Head } from "@inertiajs/react";
import { Renderer } from "@lattice/lattice/core/renderer";
import { useRegistry } from "@lattice/lattice/provider";
import type { PagePayload } from "@lattice/lattice";
import { cn } from "@lattice/lattice/lib/utils";

type Props = {
  lattice: PagePayload;
};

export default function Page({ lattice }: Props) {
  const registry = useRegistry();
  const content = <Renderer fallback={null} nodes={lattice.components} registry={registry} />;

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

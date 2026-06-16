import { Skeleton } from "@lattice-php/lattice/core/components/skeleton";
import type { RendererComponent } from "@lattice-php/lattice/core/types";

export const FormSkeletonComponent: RendererComponent<"form"> = ({ node }) => {
  const fieldCount = Math.max(
    1,
    Math.min(
      4,
      node.schema
        ?.find((child) => child.type === "grid")
        ?.schema?.filter((child) => child.type !== "field.hidden-input").length ?? 2,
    ),
  );

  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface p-6 shadow-xs"
      data-lattice-skeleton={node.id ?? node.type}
    >
      <div className="grid gap-6">
        {Array.from({ length: fieldCount }).map((_, index) => (
          <div className="grid gap-2" key={index}>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10" />
          </div>
        ))}

        <Skeleton className="mt-4 h-10" />
      </div>
    </div>
  );
};

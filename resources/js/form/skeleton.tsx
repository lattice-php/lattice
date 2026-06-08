import type { LatticeRendererComponent } from "@/lattice/core/types";

export const FormSkeletonComponent: LatticeRendererComponent<"form"> = ({ node }) => {
  const fieldCount = Math.max(
    1,
    Math.min(
      4,
      node.children
        ?.find((child) => child.type === "grid")
        ?.children?.filter((child) => child.type !== "form.hidden-input").length ?? 2,
    ),
  );

  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-md animate-pulse flex-col gap-6 rounded-lg border bg-card p-6 shadow-xs"
      data-lattice-skeleton={node.id ?? node.type}
    >
      <div className="grid gap-6">
        {Array.from({ length: fieldCount }).map((_, index) => (
          <div className="grid gap-2" key={index}>
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-10 rounded-md bg-muted" />
          </div>
        ))}

        <div className="mt-4 h-10 rounded-md bg-muted" />
      </div>
    </div>
  );
};

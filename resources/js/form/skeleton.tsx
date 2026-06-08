import type { RendererComponent } from "@lattice/core/types";

export const FormSkeletonComponent: RendererComponent<"form"> = ({ node }) => {
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
      className="mx-auto flex w-full max-w-md animate-pulse flex-col gap-6 rounded-lt border border-lt-border bg-lt-surface p-6 shadow-xs"
      data-lattice-skeleton={node.id ?? node.type}
    >
      <div className="grid gap-6">
        {Array.from({ length: fieldCount }).map((_, index) => (
          <div className="grid gap-2" key={index}>
            <div className="h-4 w-28 rounded bg-lt-muted" />
            <div className="h-10 rounded-lt-sm bg-lt-muted" />
          </div>
        ))}

        <div className="mt-4 h-10 rounded-lt-sm bg-lt-muted" />
      </div>
    </div>
  );
};

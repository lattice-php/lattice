import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import { useSearchContext } from "../../context";

export type SearchCategoriesProps = {
  "data-test"?: string;
};

export function SearchCategories({ "data-test": testId }: SearchCategoriesProps = {}) {
  const { categories, activeCategory, setCategory } = useSearchContext();

  return (
    <div
      data-test={testId}
      className="flex gap-1 overflow-x-auto p-1 md:flex-col md:overflow-x-visible"
    >
      {categories.map((category) => (
        <button
          key={category.name}
          aria-pressed={category.name === activeCategory}
          className={cn(
            "flex min-h-11 shrink-0 items-center justify-between gap-2 rounded-lt-sm px-3 text-start text-sm md:w-full",
            category.name === activeCategory
              ? "bg-lt-muted text-lt-fg"
              : "text-lt-muted-fg hover:bg-lt-muted/60",
          )}
          onClick={() => setCategory(category.name)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            {category.icon ? (
              <Icon name={category.icon} aria-hidden="true" className="size-lt-icon-sm" />
            ) : null}
            <span className="truncate">{category.label}</span>
          </span>
          {category.count !== null ? (
            <span className="text-xs tabular-nums text-lt-muted-fg">{category.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

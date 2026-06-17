import { Icon } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useSearchContext } from "../context";

const SearchCategories: RendererComponent<"search.categories"> = () => {
  const { categories, activeCategory, setCategory } = useSearchContext();

  return (
    <div className="flex flex-col gap-1 p-1">
      {categories.map((category) => (
        <button
          key={category.name}
          aria-pressed={category.name === activeCategory}
          className={cn(
            "flex items-center justify-between gap-2 rounded-lt-sm px-3 py-2 text-left text-sm",
            category.name === activeCategory
              ? "bg-lt-muted text-lt-fg"
              : "text-lt-muted-fg hover:bg-lt-muted/60",
          )}
          onClick={() => setCategory(category.name)}
          type="button"
        >
          <span className="flex items-center gap-2">
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
};

export default SearchCategories;

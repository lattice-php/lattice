import { Loader2Icon } from "lucide-react";

import { cn } from "@lattice/lattice/lib/utils";
import { useT } from "@lattice/lattice/i18n";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const { t } = useT();

  return (
    <Loader2Icon
      role="status"
      aria-label={t("a11y.loading", "Loading")}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };

import { Icon } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const { t } = useT("lattice");

  return (
    <Icon
      name="loader-2"
      role="status"
      aria-label={t("common.loading", "Loading")}
      aria-hidden={false}
      className={cn("animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };

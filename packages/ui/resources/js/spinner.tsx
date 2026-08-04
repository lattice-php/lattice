import { Icon } from "./icons";
import { cn } from "./lib/utils";
import { useT } from "./i18n";

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

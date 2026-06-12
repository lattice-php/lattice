import { Icon } from "@lattice/lattice/icons";
import { cn } from "@lattice/lattice/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Icon
      name="loader-2"
      role="status"
      aria-label="Loading"
      aria-hidden={false}
      className={cn("animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };

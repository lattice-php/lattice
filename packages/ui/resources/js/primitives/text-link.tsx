import { cn } from "../lib/utils";
import { useNavigation, type NavLinkProps } from "../navigation";

export function TextLink({ className = "", children, ...props }: NavLinkProps) {
  const { Link } = useNavigation();

  return (
    <Link
      className={cn(
        "text-lt-fg underline decoration-lt-border underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-lt-border",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

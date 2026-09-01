import type { ComponentProps } from "react";
import type { AvatarShape, Size } from "../../generated";
import { cn } from "../../lib/utils";

export type AvatarProps = Omit<ComponentProps<"span">, "children"> & {
  name?: string | null;
  shape?: AvatarShape;
  size?: Size;
  src?: string | null;
};

const sizeClasses: Record<Size, string> = {
  xs: "size-6 text-[0.5rem]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
  "2xl": "size-20 text-xl",
  "3xl": "size-24 text-2xl",
  "4xl": "size-32 text-3xl",
};

export function Avatar({
  className,
  name,
  shape = "circle",
  size = "md",
  src,
  ...props
}: AvatarProps) {
  const label = name ?? undefined;

  return (
    <span
      data-slot="avatar"
      role={src ? undefined : "img"}
      aria-label={src ? undefined : label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden bg-lt-muted font-medium text-lt-muted-fg select-none",
        shape === "rounded" ? "rounded-lt" : "rounded-full",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={label ?? ""} className="size-full object-cover" />
      ) : name ? (
        initials(name)
      ) : (
        <UserGlyph />
      )}
    </span>
  );
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function UserGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-[60%]"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

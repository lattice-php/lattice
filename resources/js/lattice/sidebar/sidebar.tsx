import { Link } from "@inertiajs/react";
import { IconRenderer } from "@/lattice/icons";
import type { LatticeSidebarPayload } from "@/lattice/core/types";

type LatticeSidebarProps = {
  className?: string;
  sidebar?: LatticeSidebarPayload | null;
};

export function LatticeSidebar({ className, sidebar }: LatticeSidebarProps) {
  if (!sidebar?.groups.length) {
    return null;
  }

  return (
    <nav aria-label="Lattice sidebar" className={className}>
      {sidebar.groups.map((group) => (
        <section key={group.label ?? "default"}>
          {group.label && <div>{group.label}</div>}

          <ul>
            {group.items.map((item) => (
              <li key={item.key}>
                <Link
                  aria-current={item.active ? "page" : undefined}
                  data-active={item.active}
                  href={item.href}
                  prefetch
                >
                  {item.icon && <IconRenderer icon={item.icon} />}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}

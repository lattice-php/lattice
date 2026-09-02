import type { ReactNode } from "react";

export function FieldRow({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2 text-xs text-lt-fg-2">
      <label htmlFor={htmlFor} className="text-lt-muted-fg">
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2.5 border-b border-lt-border px-3 py-3">
      <h3 className="text-xs font-semibold text-lt-fg">{title}</h3>
      {children}
    </section>
  );
}

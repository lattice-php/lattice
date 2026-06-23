import { Link } from "@inertiajs/react";
import type { ComponentProps, ReactNode } from "react";
import { useAction } from "@lattice-php/lattice/action/use-action";
import { cn } from "@lattice-php/lattice/lib/utils";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { Node, RendererComponent } from "@lattice-php/lattice/core/types";
import { IconRenderer } from "@lattice-php/lattice/icons";
import type { Affix } from "@lattice-php/lattice/types/generated";
import {
  actionMenuItemClassName,
  useActionMenu,
} from "@lattice-php/lattice/action/components/action-menu-context";

const textLinkClassName =
  "text-lt-fg underline decoration-lt-border underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-lt-border";

function TextLink({ className = "", children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link className={cn(textLinkClassName, className)} {...props}>
      {children}
    </Link>
  );
}

function ActionLink({
  action,
  ariaLabel,
  className,
  children,
  testId,
}: {
  action: Node<"action">;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
  testId?: string;
}) {
  const { processing, requestSubmit, overlays } = useAction(action);

  return (
    <>
      <button
        aria-label={ariaLabel}
        className={cn(textLinkClassName, className)}
        data-test={testId}
        disabled={processing}
        onClick={requestSubmit}
        type="button"
      >
        {children}
      </button>
      {overlays}
    </>
  );
}

function LinkAffix({ affix, className }: { affix: Affix; className?: string }) {
  if (affix.icon) {
    return <IconRenderer className={cn("size-lt-icon-md shrink-0", className)} icon={affix.icon} />;
  }

  return <span className={cn("shrink-0 text-sm text-lt-muted-fg", className)}>{affix.text}</span>;
}

function LinkContent({
  icon,
  isMenuItem,
  label,
  prefix,
  suffix,
}: {
  icon?: string | null;
  isMenuItem: boolean;
  label: string;
  prefix?: Affix | null;
  suffix?: Affix | null;
}) {
  if (icon) {
    return <IconRenderer className="size-lt-icon-md shrink-0" icon={icon} />;
  }

  if (isMenuItem) {
    return (
      <>
        {prefix ? <LinkAffix affix={prefix} /> : null}
        <span>{label}</span>
        {suffix ? <LinkAffix affix={suffix} className="ml-auto" /> : null}
      </>
    );
  }

  if (prefix || suffix) {
    return (
      <span className="inline-flex items-center gap-1.5 align-baseline">
        {prefix ? <LinkAffix affix={prefix} /> : null}
        <span>{label}</span>
        {suffix ? <LinkAffix affix={suffix} /> : null}
      </span>
    );
  }

  return label;
}

function labelWithTextAffixes(label: string, prefix?: Affix | null, suffix?: Affix | null) {
  if (!prefix?.text && !suffix?.text) {
    return undefined;
  }

  return [prefix?.text, label, suffix?.text]
    .filter((part): part is string => Boolean(part))
    .join(" ");
}

const LinkComponent: RendererComponent<"link"> = ({ node }) => {
  const isMenuItem = useActionMenu();
  const action = node.props.action;
  const icon = node.props.icon;
  const label = node.props.label;
  const prefix = node.props.prefix;
  const suffix = node.props.suffix;
  const iconOnly = Boolean(icon);
  const content = (
    <LinkContent
      icon={icon}
      isMenuItem={isMenuItem}
      label={label}
      prefix={prefix}
      suffix={suffix}
    />
  );
  const ariaLabel = iconOnly ? label : labelWithTextAffixes(label, prefix, suffix);

  if (action) {
    return (
      <ActionLink
        action={action as Node<"action">}
        ariaLabel={ariaLabel}
        className={isMenuItem ? actionMenuItemClassName : undefined}
        testId={nodeIdentity(node)}
      >
        {content}
      </ActionLink>
    );
  }

  return (
    <TextLink
      aria-label={ariaLabel}
      className={isMenuItem ? actionMenuItemClassName : undefined}
      data-test={nodeIdentity(node)}
      href={node.props.href ?? "#"}
      method={node.props.method ?? "get"}
      tabIndex={node.props.tabIndex ?? undefined}
    >
      {content}
    </TextLink>
  );
};

export default LinkComponent;
export { TextLink };

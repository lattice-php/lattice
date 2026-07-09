import { Link } from "@inertiajs/react";
import type { ComponentProps } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { nodeIdentity } from "@lattice-php/lattice/core/test-id";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { ActionTrigger, type TriggerState, useClickBehavior } from "@lattice-php/lattice/action";
import { IconRenderer } from "@lattice-php/lattice/icons";
import type { Affix } from "@lattice-php/lattice/types/generated";
import { actionMenuItemClassName, useActionMenu } from "@lattice-php/lattice/action";

const textLinkClassName =
  "text-lt-fg underline decoration-lt-border underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-lt-border";

function TextLink({ className = "", children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link className={cn(textLinkClassName, className)} {...props}>
      {children}
    </Link>
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
  const { icon, label, prefix, suffix } = node.props;
  const behavior = useClickBehavior(node.props);
  const className = isMenuItem ? actionMenuItemClassName : undefined;
  const testId = nodeIdentity(node);
  const content = (
    <LinkContent
      icon={icon}
      isMenuItem={isMenuItem}
      label={label}
      prefix={prefix}
      suffix={suffix}
    />
  );
  const ariaLabel = icon ? label : labelWithTextAffixes(label, prefix, suffix);

  const triggerButton = ({ onClick, processing }: TriggerState) => (
    <button
      aria-label={ariaLabel}
      className={cn(textLinkClassName, className)}
      data-test={testId}
      disabled={processing}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );

  if (behavior.kind === "action") {
    return <ActionTrigger action={behavior.action}>{triggerButton}</ActionTrigger>;
  }

  if (behavior.kind === "effects") {
    return triggerButton({ onClick: behavior.onClick, processing: false });
  }

  return (
    <TextLink
      aria-label={ariaLabel}
      className={className}
      data-test={testId}
      href={behavior.kind === "navigate" ? behavior.href : "#"}
      method={behavior.kind === "navigate" ? behavior.method : "get"}
      tabIndex={node.props.tabIndex ?? undefined}
    >
      {content}
    </TextLink>
  );
};

export default LinkComponent;
export { TextLink };

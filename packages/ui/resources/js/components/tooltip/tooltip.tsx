import type { ReactNode } from "react";
import { Icon } from "../../icons";
import { UI_NAMESPACE, useT } from "../../i18n";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";

export type TooltipProps = {
  "aria-label"?: string;
  content?: ReactNode;
  trigger?: ReactNode;
};

export function Tooltip({ "aria-label": ariaLabel, content, trigger }: TooltipProps) {
  const { t } = useT(UI_NAMESPACE);

  if (!hasContent(content)) {
    return null;
  }

  const hasTrigger = hasContent(trigger);

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        aria-label={
          ariaLabel ?? (hasTrigger ? undefined : t("common.more-info", "More information"))
        }
        className={
          hasTrigger
            ? "inline-flex items-center rounded-lt-sm outline-none focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]"
            : "ml-1 inline-flex rounded-lt-sm text-lt-muted-fg outline-none hover:text-lt-fg focus-visible:text-lt-fg focus-visible:ring-lt-ring/50 focus-visible:ring-[length:var(--lt-ring-width)]"
        }
      >
        {hasTrigger ? trigger : <Icon name="info" className="size-lt-icon-sm" />}
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-xs p-3 text-sm [&_a]:underline">
        {content}
      </PopoverContent>
    </Popover>
  );
}

function hasContent(node: ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== "";
}

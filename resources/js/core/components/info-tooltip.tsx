import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function InfoTooltip({ content }: { content?: string | null }) {
  const { t } = useT("lattice");

  if (!content) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        aria-label={t("a11y.moreInfo", "More information")}
        className="ml-1 inline-flex rounded-lt-sm text-lt-muted-fg outline-none hover:text-lt-fg focus-visible:text-lt-fg focus-visible:ring-lt-ring/50 focus-visible:ring-[3px]"
      >
        <Icon name="info" className="size-lt-icon-sm" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="max-w-xs p-3 text-sm [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Popover>
  );
}

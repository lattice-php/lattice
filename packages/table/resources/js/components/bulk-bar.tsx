import { Button } from "@lattice-php/ui/components/button/button";
import { ActionTrigger } from "@lattice-php/ui/click-behavior";
import { DataTableBulkBar } from "@lattice-php/table/primitives/data-table";
import { Spinner } from "@lattice-php/ui/primitives/spinner";
import { prefixedTestId } from "@lattice-php/core/test-id";
import { useT } from "@lattice-php/ui/i18n";
import type { Node } from "@lattice-php/core/types";

export function BulkBar({
  actions,
  selectedKeys,
  allMatching,
  total,
  query,
  canSelectAllMatching,
  onSelectAllMatching,
  onCompleted,
}: {
  actions: Node<"action" | "action.bulk">[];
  selectedKeys: string[];
  allMatching: boolean;
  total?: number;
  query: Record<string, unknown>;
  canSelectAllMatching: boolean;
  onSelectAllMatching: () => void;
  onCompleted: () => void;
}) {
  const { t } = useT("lattice");

  const selectionPayload = (): Record<string, unknown> =>
    allMatching ? { allMatching: true, ...query } : { selected: selectedKeys };

  const count = allMatching ? (total ?? selectedKeys.length) : selectedKeys.length;

  return (
    <DataTableBulkBar
      summary={
        allMatching
          ? t("table.bulk.all-selected", "All {{count}} selected", { count })
          : t("table.bulk.selected", "{{count}} selected", { count })
      }
      action={
        canSelectAllMatching && (
          <button
            type="button"
            data-test="bulk-select-all-matching"
            className="font-medium text-lt-primary underline underline-offset-2"
            onClick={onSelectAllMatching}
          >
            {t("table.bulk.select-all-matching", "Select all {{total}} matching", { total })}
          </button>
        )
      }
    >
      {actions.map((action, index) => (
        <ActionTrigger
          key={action.key ?? action.id ?? index}
          action={action}
          options={{ extraData: selectionPayload, onSuccess: onCompleted }}
        >
          {({ onClick, processing }) => (
            <Button
              type="button"
              data-test={prefixedTestId("bulk-action", action.id)}
              variant={action.props.variant}
              emphasis={action.props.emphasis}
              disabled={processing}
              onClick={onClick}
            >
              {processing && <Spinner />}
              {action.props.label}
            </Button>
          )}
        </ActionTrigger>
      ))}
    </DataTableBulkBar>
  );
}

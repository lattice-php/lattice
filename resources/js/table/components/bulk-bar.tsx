import { useState } from "react";
import { ActionForm, runAction } from "@lattice-php/lattice/action";
import { apiFetch } from "@lattice-php/lattice/core/api";
import { useEffectDispatcher } from "@lattice-php/lattice/effects/use-effect-dispatcher";
import { Button } from "@lattice-php/lattice/ui/button";
import { ConfirmDialog } from "@lattice-php/lattice/ui/confirm-dialog";
import { Spinner } from "@lattice-php/lattice/ui/spinner";
import { prefixedTestId } from "@lattice-php/lattice/core/test-id";
import { useT } from "@lattice-php/lattice/i18n";
import type { BulkAction } from "@lattice-php/lattice/table/lib/bulk";

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
  actions: BulkAction[];
  selectedKeys: string[];
  allMatching: boolean;
  total?: number;
  query: Record<string, unknown>;
  canSelectAllMatching: boolean;
  onSelectAllMatching: () => void;
  onCompleted: () => void;
}) {
  const { t } = useT("lattice");
  const [processing, setProcessing] = useState(false);
  const dispatch = useEffectDispatcher();
  const [confirming, setConfirming] = useState<BulkAction | null>(null);
  const [filling, setFilling] = useState<BulkAction | null>(null);

  const selectionPayload = (): Record<string, unknown> =>
    allMatching ? { allMatching: true, ...query } : { selected: selectedKeys };

  async function submit(action: BulkAction): Promise<void> {
    setProcessing(true);

    const ok = await runAction(
      () =>
        apiFetch(action.endpoint, {
          method: action.method,
          ref: action.ref,
          body: JSON.stringify(selectionPayload()),
          throwOnError: false,
        }),
      dispatch,
    );

    setProcessing(false);

    if (ok) {
      setConfirming(null);
      onCompleted();
    }
  }

  function run(action: BulkAction): void {
    if (action.form) {
      setFilling(action);

      return;
    }

    if (action.confirmation) {
      setConfirming(action);

      return;
    }

    void submit(action);
  }

  const count = allMatching ? (total ?? selectedKeys.length) : selectedKeys.length;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-lt-border bg-lt-muted/50 p-4 text-sm">
      <span className="font-medium">
        {allMatching
          ? t("table.bulk.all-selected", "All {{count}} selected", { count })
          : t("table.bulk.selected", "{{count}} selected", { count })}
      </span>
      {canSelectAllMatching && (
        <button
          type="button"
          data-test="bulk-select-all-matching"
          className="font-medium text-lt-primary underline underline-offset-2"
          onClick={onSelectAllMatching}
        >
          {t("table.bulk.select-all-matching", "Select all {{total}} matching", { total })}
        </button>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            type="button"
            data-test={prefixedTestId("bulk-action", action.id)}
            variant={action.variant}
            color={action.color}
            disabled={processing}
            onClick={() => run(action)}
          >
            {processing && <Spinner />}
            {action.label}
          </Button>
        ))}
      </div>

      {confirming?.confirmation && (
        <ConfirmDialog
          title={confirming.confirmation.title ?? confirming.label}
          description={confirming.confirmation.description ?? undefined}
          confirmLabel={confirming.confirmation.confirmLabel ?? confirming.label}
          cancelLabel={confirming.confirmation.cancelLabel ?? t("common.cancel", "Cancel")}
          confirmVariant={confirming.variant}
          confirmColor={confirming.color}
          processing={processing}
          onConfirm={() => void submit(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}

      {filling?.form && (
        <ActionForm
          cancelLabel={filling.confirmation?.cancelLabel ?? t("common.cancel", "Cancel")}
          componentRef={filling.ref}
          description={filling.confirmation?.description ?? undefined}
          endpoint={filling.endpoint}
          extraData={selectionPayload()}
          formNode={filling.form}
          method={filling.method}
          onClose={() => setFilling(null)}
          onSuccess={() => {
            setFilling(null);
            onCompleted();
          }}
          placement={filling.modalSide ?? "center"}
          submitLabel={filling.confirmation?.confirmLabel ?? filling.label}
          title={filling.confirmation?.title ?? filling.label}
          width={filling.modalWidth ?? undefined}
        />
      )}
    </div>
  );
}

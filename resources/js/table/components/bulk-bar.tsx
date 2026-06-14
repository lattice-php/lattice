import { useHttp } from "@inertiajs/react";
import { useState } from "react";
import { ActionForm } from "@lattice-php/lattice/action/components/action-form";
import {
  dispatchActionEffects,
  dispatchActionError,
  getActionEffects,
} from "@lattice-php/lattice/action/effects";
import type { ActionResponse } from "@lattice-php/lattice/action/effects";
import { withHeaders } from "@lattice-php/lattice/core/headers";
import { Button } from "@lattice-php/lattice/core/components/button";
import { ConfirmDialog } from "@lattice-php/lattice/core/components/confirm-dialog";
import { Spinner } from "@lattice-php/lattice/core/components/spinner";
import { prefixedTestId } from "@lattice-php/lattice/core/test-id";
import { useT } from "@lattice-php/lattice/i18n";
import type { BulkAction } from "../bulk";

type BulkData = {
  allMatching?: boolean;
  selected?: string[];
};

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
  const http = useHttp<BulkData, ActionResponse>({});
  const [confirming, setConfirming] = useState<BulkAction | null>(null);
  const [filling, setFilling] = useState<BulkAction | null>(null);

  const selectionPayload = (): Record<string, unknown> =>
    allMatching ? { allMatching: true, ...query } : { selected: selectedKeys };

  async function submit(action: BulkAction): Promise<void> {
    try {
      http.transform((data) => ({
        ...data,
        ...(allMatching ? { allMatching: true, ...query } : { selected: selectedKeys }),
      }));

      const response = await http[action.method](action.endpoint, {
        headers: withHeaders(action.ref ?? ""),
      });

      dispatchActionEffects(getActionEffects(response.effects));
      setConfirming(null);
      onCompleted();
    } catch (error) {
      dispatchActionError(error);
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
          ? t("bulk.allSelected", "All {{count}} selected", { count })
          : t("bulk.selected", "{{count}} selected", { count })}
      </span>
      {canSelectAllMatching && (
        <button
          type="button"
          data-test="bulk-select-all-matching"
          className="font-medium text-lt-primary underline underline-offset-2"
          onClick={onSelectAllMatching}
        >
          {t("bulk.selectAllMatching", "Select all {{total}} matching", { total })}
        </button>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            type="button"
            data-test={prefixedTestId("bulk-action", action.id)}
            variant={action.variant}
            disabled={http.processing}
            onClick={() => run(action)}
          >
            {http.processing && <Spinner />}
            {action.label}
          </Button>
        ))}
      </div>

      {confirming?.confirmation && (
        <ConfirmDialog
          title={confirming.confirmation.title ?? confirming.label}
          description={confirming.confirmation.description ?? undefined}
          confirmLabel={confirming.confirmation.confirmLabel ?? confirming.label}
          cancelLabel={confirming.confirmation.cancelLabel ?? "Cancel"}
          confirmVariant={confirming.variant}
          processing={http.processing}
          onConfirm={() => void submit(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}

      {filling?.form && (
        <ActionForm
          cancelLabel={filling.confirmation?.cancelLabel ?? "Cancel"}
          componentRef={filling.ref}
          description={filling.confirmation?.description ?? undefined}
          endpoint={filling.endpoint}
          extraData={selectionPayload()}
          formNode={filling.form}
          method={filling.method}
          onClose={() => setFilling(null)}
          onSuccess={(response) => {
            dispatchActionEffects(getActionEffects(response.effects));
            setFilling(null);
            onCompleted();
          }}
          submitLabel={filling.confirmation?.confirmLabel ?? filling.label}
          title={filling.confirmation?.title ?? filling.label}
        />
      )}
    </div>
  );
}

import { useHttp } from "@inertiajs/react";
import { useState } from "react";
import {
  dispatchActionEffects,
  dispatchActionError,
  getActionEffects,
} from "@lattice/action/effects";
import type { ActionEffect } from "@lattice/action/effects";
import { withRefHeader } from "@lattice/core/component-ref";
import { Button } from "@lattice/core/components/button";
import { ConfirmDialog } from "@lattice/core/components/confirm-dialog";
import { Spinner } from "@lattice/core/components/spinner";
import type { BulkAction } from "../bulk";

type BulkResponse = {
  data?: Record<string, unknown>;
  effects?: ActionEffect[];
  ok?: boolean;
};

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
  const http = useHttp<BulkData, BulkResponse>({});
  const [confirming, setConfirming] = useState<BulkAction | null>(null);

  async function submit(action: BulkAction): Promise<void> {
    try {
      http.transform((data) => ({
        ...data,
        ...(allMatching ? { allMatching: true, ...query } : { selected: selectedKeys }),
      }));

      const response = await http[action.method](action.endpoint, {
        headers: withRefHeader(action.ref ?? ""),
      });

      dispatchActionEffects(getActionEffects(response.effects));
      setConfirming(null);
      onCompleted();
    } catch (error) {
      dispatchActionError(error);
    }
  }

  function run(action: BulkAction): void {
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
        {allMatching ? `All ${count} selected` : `${count} selected`}
      </span>
      {canSelectAllMatching && (
        <button
          type="button"
          className="font-medium text-lt-primary underline underline-offset-2"
          onClick={onSelectAllMatching}
        >
          {`Select all ${total} matching`}
        </button>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            type="button"
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
          description={confirming.confirmation.description}
          confirmLabel={confirming.confirmation.confirmLabel ?? confirming.label}
          cancelLabel={confirming.confirmation.cancelLabel ?? "Cancel"}
          confirmVariant={confirming.variant}
          processing={http.processing}
          onConfirm={() => void submit(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}

import { useHttp } from "@inertiajs/react";
import { useState } from "react";
import {
  dispatchActionEffects,
  dispatchActionError,
  isActionEffect,
} from "@lattice/action/effects";
import type { ActionEffect } from "@lattice/action/effects";
import { Button } from "@lattice/core/components/button";
import { Spinner } from "@lattice/core/components/spinner";
import type { BulkAction } from "../bulk";

type BulkResponse = {
  data?: Record<string, unknown>;
  effects?: ActionEffect[];
  ok?: boolean;
};

type BulkData = {
  _lattice?: string;
  selected?: string[];
};

function getEffects(value: unknown): ActionEffect[] {
  return Array.isArray(value) ? value.filter(isActionEffect) : [];
}

export function BulkBar({
  actions,
  selectedKeys,
  onCompleted,
}: {
  actions: BulkAction[];
  selectedKeys: string[];
  onCompleted: () => void;
}) {
  const http = useHttp<BulkData, BulkResponse>({});
  const [confirming, setConfirming] = useState<BulkAction | null>(null);

  async function submit(action: BulkAction): Promise<void> {
    try {
      http.transform((data) => ({
        ...data,
        selected: selectedKeys,
        ...(action.ref ? { _lattice: action.ref } : {}),
      }));

      const response = await http[action.method](action.endpoint);

      dispatchActionEffects(getEffects(response.effects));
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

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-lt-border bg-lt-muted/50 p-4 text-sm">
      <span className="font-medium">{`${selectedKeys.length} selected`}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            aria-modal="true"
            className="w-full max-w-md rounded-lt border border-lt-border bg-lt-bg p-6 shadow-lg"
            role="dialog"
          >
            <div className="grid gap-2">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                {confirming.confirmation.title ?? confirming.label}
              </h2>
              {confirming.confirmation.description && (
                <p className="text-sm text-lt-muted-fg">{confirming.confirmation.description}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={http.processing}
                onClick={() => setConfirming(null)}
              >
                {confirming.confirmation.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                type="button"
                variant={confirming.variant}
                disabled={http.processing}
                onClick={() => void submit(confirming)}
              >
                {http.processing && <Spinner />}
                {confirming.confirmation.confirmLabel ?? confirming.label}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

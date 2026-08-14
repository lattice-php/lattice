import { useMemo } from "react";
import type { RemoteAccess } from "@lattice-php/core/api";
import type { ResolveAccessToken } from "./access-token";
import { parseOperation } from "./parse";
import { RequestPlayground, type TwoColumnBreakpoint } from "./RequestPlayground";

type OperationViewProps = {
  spec: unknown;
  operationId: string | null;
  baseUrl?: string | null;
  token?: string | null;
  remoteTokens?: RemoteAccess[] | null;
  resolveAccessToken?: ResolveAccessToken | null;
  expandDepth?: number;
  twoColumnBreakpoint?: TwoColumnBreakpoint;
  hideHeaderIdentity?: boolean;
};

export function OperationView({
  spec,
  operationId,
  baseUrl,
  token,
  remoteTokens,
  resolveAccessToken,
  expandDepth = 2,
  twoColumnBreakpoint = "lg",
  hideHeaderIdentity = false,
}: OperationViewProps): React.ReactNode {
  const operation = useMemo(
    () => (operationId ? parseOperation(spec, operationId, baseUrl ?? null) : null),
    [spec, operationId, baseUrl],
  );
  const components = (spec as { components?: unknown } | null)?.components ?? null;

  if (!operationId) {
    return (
      <div className="flex-1 p-6 text-base text-lt-muted-fg">
        Select an operation to view its details.
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="flex-1 p-6 text-base text-lt-danger">
        Operation &quot;{operationId}&quot; could not be found in this specification.
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 overflow-y-auto">
      <RequestPlayground
        key={operation.summary.id}
        operation={operation}
        baseUrl={operation.serverUrl}
        token={token ?? null}
        remoteTokens={remoteTokens ?? null}
        resolveAccessToken={resolveAccessToken ?? null}
        components={components}
        expandDepth={expandDepth}
        twoColumnBreakpoint={twoColumnBreakpoint}
        hideHeaderIdentity={hideHeaderIdentity}
      />
    </div>
  );
}

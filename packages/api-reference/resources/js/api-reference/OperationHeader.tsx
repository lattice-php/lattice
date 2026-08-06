import { Badge, CopyButton } from "@lattice-php/ui";
import { httpMethodColor } from "./http-method-color";
import { operationUrl } from "./request-builder";
import type { Operation } from "./types";

export function OperationHeader({
  operation,
  baseUrl,
  hideIdentity = false,
}: {
  operation: Operation;
  baseUrl?: string | null;
  hideIdentity?: boolean;
}): React.ReactNode {
  if (hideIdentity) {
    return operation.description ? (
      <>
        <p className="whitespace-pre-line text-lt-muted-fg">{operation.description}</p>
        <hr className="my-8 border-lt-border" />
      </>
    ) : null;
  }

  const url = operationUrl(baseUrl, operation.summary.path);

  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          color={httpMethodColor(operation.summary.method)}
          className="text-xs font-semibold uppercase"
        >
          {operation.summary.method}
        </Badge>
        <div className="inline-flex min-w-0 items-center gap-1">
          <span className="font-mono text-lt-muted-fg">{url}</span>
          <CopyButton value={url} label="operation URL" iconOnly className="size-7" />
        </div>
        {operation.summary.deprecated ? <Badge color="danger">deprecated</Badge> : null}
      </div>
      <h1 className="mt-2 text-lg font-semibold text-lt-fg">{operation.summary.title}</h1>
      {operation.description ? (
        <>
          <p className="mt-1 whitespace-pre-line text-lt-muted-fg">{operation.description}</p>
          <hr className="my-8 border-lt-border" />
        </>
      ) : null}
    </header>
  );
}

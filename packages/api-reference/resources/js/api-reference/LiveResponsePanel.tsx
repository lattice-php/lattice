import { Badge } from "@lattice-php/ui/badge";
import { CodeBlock } from "@lattice-php/ui";
import type { ColorName } from "@lattice-php/core";
import type { ExecutedResponse, ExecutionError } from "./execute-request";

type LiveResponsePanelProps = {
  result: ExecutedResponse | ExecutionError | null;
};

export function LiveResponsePanel({ result }: LiveResponsePanelProps): React.ReactNode {
  if (result === null) {
    return null;
  }

  if (result.kind === "error") {
    return (
      <section aria-live="polite" className="flex flex-col gap-3 border-t border-lt-border pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-lt-fg">Live response</h3>
          <Badge color="danger">Error</Badge>
        </div>
        <p className="text-lt-danger">{result.message}</p>
      </section>
    );
  }

  return (
    <section aria-live="polite" className="flex flex-col gap-4 border-t border-lt-border pt-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-lt-fg">Live response</h3>
        <Badge color={responseBadgeColor(result.status)}>
          {result.status} {result.statusText}
        </Badge>
        <span className="text-xs text-lt-muted-fg">{result.durationMs} ms</span>
      </div>
      {result.headers.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-lt-muted-fg">
            Response headers
          </h4>
          <dl className="flex flex-col gap-1 text-xs">
            {result.headers.map(([name, value]) => (
              <div key={name} className="flex flex-wrap gap-2">
                <dt className="font-mono text-lt-fg">{name}</dt>
                <dd className="wrap-anywhere text-lt-muted-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      <CodeBlock
        aria-label="Live response body"
        copyable
        language={result.contentType?.toLowerCase().includes("json") ? "json" : "text"}
        lineNumbers
        maxHeight={800}
        wrap
      >
        {result.body}
      </CodeBlock>
    </section>
  );
}

export function responseBadgeColor(status: string | number | null): ColorName {
  return (
    ({ "2": "success", "3": "info", "4": "warning", "5": "danger" } as const)[String(status)[0]] ??
    "default"
  );
}

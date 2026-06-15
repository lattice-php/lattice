import { useEffect, useRef } from "react";
import { useStream } from "@laravel/stream-react";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { xsrfToken } from "../../form/components/form-transport";
import { testIdentity } from "../test-id";
import { Button } from "./button";

export const StreamComponent: RendererComponent<"stream"> = ({ node }) => {
  const { endpoint, auto, placeholder } = node.props;
  const { data, isFetching, isStreaming, send, cancel } = useStream(endpoint ?? "", {
    csrfToken: xsrfToken(),
  });

  const startedRef = useRef(false);

  useEffect(() => {
    if (auto !== false && endpoint && !startedRef.current) {
      startedRef.current = true;
      send({});
    }
  }, [auto, endpoint, send]);

  const hasOutput = data !== "";

  function run(): void {
    if (endpoint) {
      send({});
    }
  }

  const status = isStreaming
    ? "Streaming…"
    : isFetching
      ? "Connecting…"
      : hasOutput
        ? "Done"
        : "Idle";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          data-test={testIdentity("stream-start")}
          disabled={!endpoint || isFetching || isStreaming}
          onClick={run}
          size="sm"
          type="button"
          variant="outline"
        >
          {hasOutput ? "Regenerate" : "Start"}
        </Button>
        {(isFetching || isStreaming) && (
          <Button onClick={cancel} size="sm" type="button" variant="ghost">
            Stop
          </Button>
        )}
        <span
          className="ml-auto text-xs font-medium text-lt-muted-fg"
          data-test={testIdentity("stream-status")}
        >
          {status}
        </span>
      </div>

      <div
        className={cn(
          "min-h-16 whitespace-pre-wrap rounded-lt-sm border border-lt-border bg-lt-muted/30 p-3 text-sm",
        )}
        data-test={testIdentity("stream-output")}
      >
        {hasOutput ? data : <span className="text-lt-muted-fg">{placeholder ?? ""}</span>}
      </div>
    </div>
  );
};

export default StreamComponent;

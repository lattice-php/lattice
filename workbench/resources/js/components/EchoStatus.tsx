import { echoIsConfigured, useConnectionStatus } from "@laravel/echo-react";
import type { RendererComponent } from "@lattice-php/lattice/core/types";

function ConnectionStatus() {
  const status = useConnectionStatus();

  return <span data-test="echo-status">{status}</span>;
}

const EchoStatus: RendererComponent<"echo-status"> = () => {
  if (!echoIsConfigured()) {
    return <span data-test="echo-status">unconfigured</span>;
  }

  return <ConnectionStatus />;
};

export default EchoStatus;

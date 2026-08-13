import { NativeSelect } from "@lattice-php/ui/native-select";
import type { Server } from "./types";

function serverLabel(server: Server): string {
  return server.description ? `${server.description} — ${server.url}` : server.url;
}

export function ServerPicker({
  servers,
  selectedServerUrl,
  onServerChange,
}: {
  servers: Server[];
  selectedServerUrl: string | null;
  onServerChange: (url: string) => void;
}): React.ReactNode {
  if (servers.length === 0) return null;

  if (servers.length === 1) {
    return (
      <p className="truncate py-1 text-xs text-lt-muted-fg" title={servers[0].url}>
        {serverLabel(servers[0])}
      </p>
    );
  }

  return (
    <NativeSelect
      value={selectedServerUrl ?? ""}
      onChange={(event) => onServerChange(event.target.value)}
      aria-label="Select server"
    >
      {servers.map((server) => (
        <option key={server.url} value={server.url}>
          {serverLabel(server)}
        </option>
      ))}
    </NativeSelect>
  );
}

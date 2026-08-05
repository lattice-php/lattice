import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Logger } from "vite";

const MAX_STDERR_CHARS = 500;

/**
 * Deliberately absent from `package.json#exports`: unreachable from outside
 * the package even though it compiles into `dist/`. `spawnProcess`/`fileExists`
 * are test seams — the only real caller uses the defaults.
 */
export function refreshTypeScriptTypes(
  appRoot: string,
  logger: Pick<Logger, "info" | "warn">,
  spawnProcess: typeof spawn = spawn,
  fileExists: typeof existsSync = existsSync,
): void {
  if (!fileExists(path.join(appRoot, "artisan"))) {
    return;
  }

  const child = spawnProcess("php", ["artisan", "lattice:typescript"], {
    cwd: appRoot,
    stdio: ["ignore", "ignore", "pipe"],
  });

  let stderr = "";
  let warned = false;

  const warnOnce = (message: string): void => {
    if (warned) {
      return;
    }

    warned = true;
    logger.warn(message);
  };

  child.stderr?.on("data", (chunk: Buffer) => {
    if (stderr.length < MAX_STDERR_CHARS) {
      stderr += chunk.toString();
    }
  });

  // An unhandled "error" on the piped stream (e.g. EPIPE) would crash the dev server.
  child.stderr?.on("error", () => {});

  child.on("error", (error) => {
    warnOnce(`[lattice] could not refresh TypeScript types: ${error.message}`);
  });

  child.on("exit", (code) => {
    if (code === 0) {
      logger.info("[lattice] refreshed TypeScript types");
    }
  });

  // "exit" can fire before stderr has flushed; "close" only fires once all stdio has drained.
  child.on("close", (code) => {
    if (code === 0) {
      return;
    }

    const detail = stderr.trim().slice(0, MAX_STDERR_CHARS);

    warnOnce(
      `[lattice] php artisan lattice:typescript exited with code ${code}${detail ? `: ${detail}` : ""}`,
    );
  });
}

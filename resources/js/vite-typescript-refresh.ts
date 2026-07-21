import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Logger } from "vite";

/**
 * Upper bound on how much of the child's stderr gets folded into the failure
 * warning — enough to see the actual error, not enough to flood the terminal
 * with a runaway stack trace or a misconfigured command's full output.
 */
const MAX_STDERR_CHARS = 500;

/**
 * Best-effort: skips silently when the project has no `artisan` (e.g. a
 * plain JS workspace, or a package's own workbench that isn't Laravel-shaped),
 * logs one short line on success, and only warns — never throws — on failure,
 * so a broken `php` install can't crash the dev server.
 *
 * Kept out of the published `vite` subpath on purpose: this module is not
 * listed in `package.json#exports`, so it's unreachable from outside the
 * package even though it compiles into `dist/`. `spawnProcess`/`fileExists`
 * are test seams (default to the real Node APIs) — `vite.ts`'s
 * `typescriptPlugin`, the only real caller, always uses the defaults.
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

  // A piped stream can itself emit "error" (e.g. EPIPE) — without a listener
  // here, Node treats it as unhandled and can crash the dev server, a failure
  // surface that didn't exist while stderr was `stdio: "ignore"`.
  child.stderr?.on("error", () => {});

  child.on("error", (error) => {
    warnOnce(`[lattice] could not refresh TypeScript types: ${error.message}`);
  });

  child.on("exit", (code) => {
    if (code === 0) {
      logger.info("[lattice] refreshed TypeScript types");
    }
  });

  // "exit" can fire before the child's final stderr "data" events arrive —
  // "close" is the event Node guarantees only fires once all stdio has
  // finished flowing, so the buffered stderr is complete by the time we read
  // it here. `warnOnce` keeps this and the "error" handler above from ever
  // both firing a warning for the same failure.
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

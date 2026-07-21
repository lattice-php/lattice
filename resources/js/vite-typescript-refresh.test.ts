import type { ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import path from "node:path";
import type { Logger } from "vite";
import { describe, expect, it, vi } from "vitest";
import { refreshTypeScriptTypes } from "./vite-typescript-refresh";

type FakeLogger = Pick<Logger, "info" | "warn">;

function fakeLogger(): FakeLogger {
  return { info: vi.fn(), warn: vi.fn() };
}

function fakeChild(): EventEmitter & { stderr: EventEmitter } {
  const child = new EventEmitter() as EventEmitter & { stderr: EventEmitter };

  child.stderr = new EventEmitter();

  return child;
}

describe("refreshTypeScriptTypes", () => {
  it("spawns php artisan lattice:typescript when the project has an artisan file", () => {
    const appRoot = path.resolve("/tmp/lattice-app");
    const child = fakeChild();
    const spawnProcess = vi.fn().mockReturnValue(child as unknown as ChildProcess);
    const fileExists = vi.fn().mockReturnValue(true);
    const logger = fakeLogger();

    refreshTypeScriptTypes(appRoot, logger, spawnProcess, fileExists);

    expect(fileExists).toHaveBeenCalledWith(path.join(appRoot, "artisan"));
    expect(spawnProcess).toHaveBeenCalledWith("php", ["artisan", "lattice:typescript"], {
      cwd: appRoot,
      stdio: ["ignore", "ignore", "pipe"],
    });

    child.emit("exit", 0);

    expect(logger.info).toHaveBeenCalledWith("[lattice] refreshed TypeScript types");
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("skips silently when the project has no artisan file", () => {
    const spawnProcess = vi.fn();
    const fileExists = vi.fn().mockReturnValue(false);
    const logger = fakeLogger();

    refreshTypeScriptTypes(path.resolve("/tmp/lattice-app"), logger, spawnProcess, fileExists);

    expect(spawnProcess).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it("warns, without crashing, when the spawned process itself fails", () => {
    const child = fakeChild();
    const spawnProcess = vi.fn().mockReturnValue(child as unknown as ChildProcess);
    const fileExists = vi.fn().mockReturnValue(true);
    const logger = fakeLogger();

    refreshTypeScriptTypes(path.resolve("/tmp/lattice-app"), logger, spawnProcess, fileExists);

    expect(() => child.emit("error", new Error("spawn php ENOENT"))).not.toThrow();
    expect(logger.warn).toHaveBeenCalledWith(
      "[lattice] could not refresh TypeScript types: spawn php ENOENT",
    );
  });

  it("warns with the command's stderr when it exits with a non-zero code", () => {
    const child = fakeChild();
    const spawnProcess = vi.fn().mockReturnValue(child as unknown as ChildProcess);
    const fileExists = vi.fn().mockReturnValue(true);
    const logger = fakeLogger();

    refreshTypeScriptTypes(path.resolve("/tmp/lattice-app"), logger, spawnProcess, fileExists);
    child.stderr.emit("data", Buffer.from('Class "App\\Models\\Widget" not found\n'));
    child.emit("exit", 1);

    expect(logger.warn).toHaveBeenCalledWith(
      '[lattice] php artisan lattice:typescript exited with code 1: Class "App\\Models\\Widget" not found',
    );
    expect(logger.info).not.toHaveBeenCalled();
  });

  it("warns with just the exit code when the command produced no stderr", () => {
    const child = fakeChild();
    const spawnProcess = vi.fn().mockReturnValue(child as unknown as ChildProcess);
    const fileExists = vi.fn().mockReturnValue(true);
    const logger = fakeLogger();

    refreshTypeScriptTypes(path.resolve("/tmp/lattice-app"), logger, spawnProcess, fileExists);
    child.emit("exit", 1);

    expect(logger.warn).toHaveBeenCalledWith(
      "[lattice] php artisan lattice:typescript exited with code 1",
    );
  });

  it("truncates a runaway stderr instead of flooding the warning", () => {
    const child = fakeChild();
    const spawnProcess = vi.fn().mockReturnValue(child as unknown as ChildProcess);
    const fileExists = vi.fn().mockReturnValue(true);
    const logger = fakeLogger();

    refreshTypeScriptTypes(path.resolve("/tmp/lattice-app"), logger, spawnProcess, fileExists);
    child.stderr.emit("data", Buffer.from("x".repeat(2000)));
    child.emit("exit", 1);

    const [message] = (logger.warn as ReturnType<typeof vi.fn>).mock.calls[0] as [string];

    expect(message.length).toBeLessThan(600);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});

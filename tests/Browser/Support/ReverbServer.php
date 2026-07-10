<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests\Browser\Support;

use Pest\Browser\Support\Port;
use RuntimeException;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

/**
 * A managed Reverb websocket server, one per parallel test worker, bound to a
 * dynamic free port. Mirrors the pest-plugin-browser PlaywrightNpmServer: spawn
 * via symfony/process, wait for the ready marker on stdout, and tear down on
 * process shutdown.
 */
final readonly class ReverbServer
{
    private const string HOST = '127.0.0.1';

    private const string APP_ID = 'lattice-test';

    private const string APP_KEY = 'test-key';

    private const string APP_SECRET = 'test-secret';

    private const string READY_MARKER = 'Starting server on';

    private function __construct(
        private int $port,
        private Process $process,
    ) {}

    public static function boot(): self
    {
        $port = Port::find();

        $process = new Process(
            [PHP_BINARY, 'artisan', 'reverb:start', '--host='.self::HOST, '--port='.$port, '--debug'],
            dirname(__DIR__, 3),
            self::environment($port),
        );

        // Bound only the startup wait — a wedged reverb:start would otherwise
        // hang the suite until the CI global timeout with no diagnostics. The
        // timeout is lifted once ready so the server can outlive the wait.
        $process->setTimeout(30);
        $process->start();

        try {
            $process->waitUntil(
                fn (string $type, string $output): bool => str_contains($output, self::READY_MARKER),
            );
        } catch (ProcessTimedOutException) {
            throw new RuntimeException(
                'Reverb did not become ready within 30 seconds. Output: '.$process->getOutput().' Error: '.$process->getErrorOutput(),
            );
        }

        $process->setTimeout(null);

        if (! $process->isRunning()) {
            throw new RuntimeException(
                'Reverb failed to start. Output: '.$process->getOutput().' Error: '.$process->getErrorOutput(),
            );
        }

        $server = new self($port, $process);

        register_shutdown_function(static fn () => $server->stop());

        return $server;
    }

    public function stop(): void
    {
        if ($this->process->isRunning()) {
            $this->process->stop(0.1, SIGTERM);
        }
    }

    public function host(): string
    {
        return self::HOST;
    }

    public function port(): int
    {
        return $this->port;
    }

    public function appId(): string
    {
        return self::APP_ID;
    }

    public function appKey(): string
    {
        return self::APP_KEY;
    }

    public function appSecret(): string
    {
        return self::APP_SECRET;
    }

    /**
     * @return array<string, string>
     */
    private static function environment(int $port): array
    {
        return [
            'REVERB_SERVER_HOST' => self::HOST,
            'REVERB_SERVER_PORT' => (string) $port,
            'REVERB_HOST' => self::HOST,
            'REVERB_PORT' => (string) $port,
            'REVERB_SCHEME' => 'http',
            'REVERB_APP_ID' => self::APP_ID,
            'REVERB_APP_KEY' => self::APP_KEY,
            'REVERB_APP_SECRET' => self::APP_SECRET,
            'BROADCAST_CONNECTION' => 'reverb',
        ];
    }
}

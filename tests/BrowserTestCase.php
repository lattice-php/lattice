<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests;

use Lattice\Lattice\Tests\Browser\Support\ReverbServer;
use Pest\Browser\Playwright\Playwright;

use function Orchestra\Testbench\package_path;

class BrowserTestCase extends TestCase
{
    private static ?ReverbServer $reverb = null;

    private static bool $checkedWorkbenchManifest = false;

    #[\Override]
    protected function setUp(): void
    {
        parent::setUp();

        $this->assertWorkbenchManifestExists();

        // CI runners are slower than Playwright's tight 5s default, which
        // intermittently trips browser actions/assertions under load.
        Playwright::setTimeout(15_000);
    }

    private function assertWorkbenchManifestExists(): void
    {
        if (self::$checkedWorkbenchManifest) {
            return;
        }

        $public = package_path('vendor/orchestra/testbench-core/laravel/public');
        $manifest = $public.'/build/manifest.json';
        $hot = $public.'/hot';

        if (! is_file($manifest)) {
            throw new \RuntimeException("Missing workbench Vite manifest [{$manifest}]. Run `npm run build` before `composer test:browser`.");
        }

        // A leftover dev-server marker makes every page load assets from a dead
        // server, which renders blank pages and times out interactive tests.
        if (is_file($hot)) {
            throw new \RuntimeException("Stale Vite hot file [{$hot}]. Delete it (a `composer serve` leftover), then rerun the browser suite.");
        }

        self::$checkedWorkbenchManifest = true;
    }

    protected function bootReverb(): void
    {
        self::$reverb ??= ReverbServer::boot();

        $reverb = self::$reverb;

        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb' => [
                'driver' => 'reverb',
                'key' => $reverb->appKey(),
                'secret' => $reverb->appSecret(),
                'app_id' => $reverb->appId(),
                'options' => [
                    'host' => $reverb->host(),
                    'port' => $reverb->port(),
                    'scheme' => 'http',
                    'useTLS' => false,
                ],
            ],
            'reverb.apps.apps' => [[
                'key' => $reverb->appKey(),
                'secret' => $reverb->appSecret(),
                'app_id' => $reverb->appId(),
                'options' => [
                    'host' => $reverb->host(),
                    'port' => $reverb->port(),
                    'scheme' => 'http',
                ],
                'allowed_origins' => ['*'],
            ]],
            'workbench.reverb' => $this->reverbConfig(),
        ]);
    }

    /**
     * @return array{host: string, port: int, key: string, scheme: string}
     */
    protected function reverbConfig(): array
    {
        return [
            'host' => self::$reverb->host(),
            'port' => self::$reverb->port(),
            'key' => self::$reverb->appKey(),
            'scheme' => 'http',
        ];
    }
}

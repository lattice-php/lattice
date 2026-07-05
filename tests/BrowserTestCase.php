<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests;

use Lattice\Lattice\Tests\Browser\Support\ReverbServer;
use Pest\Browser\Playwright\Playwright;

class BrowserTestCase extends TestCase
{
    private static ?ReverbServer $reverb = null;

    #[\Override]
    protected function setUp(): void
    {
        parent::setUp();

        // CI runners are slower than Playwright's tight 5s default, which
        // intermittently trips browser actions/assertions under load.
        Playwright::setTimeout(15_000);
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

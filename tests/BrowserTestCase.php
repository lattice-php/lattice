<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests;

use Lattice\Lattice\Support\Testing\ChecksWorkbenchAssets;
use Lattice\Lattice\Tests\Browser\Support\ReverbServer;
use Pest\Browser\Api\ArrayablePendingAwaitablePage;
use Pest\Browser\Api\PendingAwaitablePage;
use Pest\Browser\Playwright\Playwright;

class BrowserTestCase extends TestCase
{
    use ChecksWorkbenchAssets;

    private static ?ReverbServer $reverb = null;

    #[\Override]
    protected function setUp(): void
    {
        parent::setUp();

        $this->assertWorkbenchManifestExists();

        // CI runners are slower than Playwright's tight 5s default, which
        // intermittently trips browser actions/assertions under load.
        Playwright::setTimeout(15_000);

        // The saveMissing dumper writes into the package's tracked lang/ dir
        // (the workbench points lang_path() there), so any page hitting a
        // missing key mid-suite would leave junk behind. No browser test
        // needs the dump — keep it off.
        config(['i18next.save_missing.enabled' => false]);
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
     * @template TUrl of array<int, string>|string
     *
     * @param  TUrl  $url
     * @return (TUrl is array<int, string> ? ArrayablePendingAwaitablePage : PendingAwaitablePage)
     */
    protected function visitAsWorkbenchUser(array|string $url): ArrayablePendingAwaitablePage|PendingAwaitablePage
    {
        $this->actingAs(\workbenchTestUser());

        return \visit($url);
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

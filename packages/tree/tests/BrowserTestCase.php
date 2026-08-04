<?php
declare(strict_types=1);

namespace Lattice\Tree\Tests;

use Pest\Browser\Playwright\Playwright;
use RuntimeException;

use function Orchestra\Testbench\package_path;

abstract class BrowserTestCase extends TestCase
{
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

    /**
     * The browser serves whatever the last `npm run build` produced; a missing
     * manifest or a leftover dev-server marker would fail every test with
     * blank pages, so fail fast with an actionable message instead.
     */
    private function assertWorkbenchManifestExists(): void
    {
        if (self::$checkedWorkbenchManifest) {
            return;
        }

        $public = package_path('vendor/orchestra/testbench-core/laravel/public');
        $manifest = $public.'/build/manifest.json';
        $hot = $public.'/hot';

        if (! is_file($manifest)) {
            throw new RuntimeException("Missing workbench Vite manifest [{$manifest}]. Run `npm run build` before the browser suite (`composer test:browser` does this for you).");
        }

        if (is_file($hot)) {
            throw new RuntimeException("Stale Vite hot file [{$hot}]. Delete it (a `composer serve` leftover), then rerun the browser suite.");
        }

        self::$checkedWorkbenchManifest = true;
    }
}

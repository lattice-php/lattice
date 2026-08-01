<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Testing;

use Pest\Browser\Playwright\Playwright;

abstract class PackageBrowserTestCase extends PackageTestCase
{
    use ChecksWorkbenchAssets;

    protected function setUp(): void
    {
        parent::setUp();

        $this->assertWorkbenchManifestExists();

        // CI runners are slower than Playwright's tight 5s default, which
        // intermittently trips browser actions/assertions under load.
        Playwright::setTimeout(15_000);
    }
}

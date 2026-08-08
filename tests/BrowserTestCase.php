<?php

declare(strict_types=1);

namespace Lattice\Tests;

use Lattice\Support\Testing\ChecksWorkbenchAssets;
use Pest\Browser\Api\ArrayablePendingAwaitablePage;
use Pest\Browser\Api\PendingAwaitablePage;
use Pest\Browser\Playwright\Playwright;
use Workbench\App\Models\User;

class BrowserTestCase extends TestCase
{
    use ChecksWorkbenchAssets;

    protected ?User $workbenchUser = null;

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

    /**
     * @template TUrl of array<int, string>|string
     *
     * @param  TUrl  $url
     * @param  array<string, mixed>  $userAttributes
     * @return (TUrl is array<int, string> ? ArrayablePendingAwaitablePage : PendingAwaitablePage)
     */
    protected function visitAsWorkbenchUser(array|string $url, array $userAttributes = []): ArrayablePendingAwaitablePage|PendingAwaitablePage
    {
        $this->workbenchUser = \workbenchTestUser($userAttributes);
        $this->actingAs($this->workbenchUser);

        return \visit($url);
    }

    protected function visitWithSeededUsers(string $url = '/', bool $namedUsersOnly = false): PendingAwaitablePage
    {
        $this->workbenchUser = \workbenchTestUser();
        $this->actingAs($this->workbenchUser);

        $namedUsersOnly ? \seedNamedWorkbenchUsers() : \seedWorkbenchUsers();

        return \visit($url);
    }
}

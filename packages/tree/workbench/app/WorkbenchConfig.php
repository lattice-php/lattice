<?php
declare(strict_types=1);

namespace Workbench\App;

/**
 * The Lattice config both consumers of the workbench share: the serve/CLI
 * path (WorkbenchServiceProvider) and the test path (tests/TestCase), which
 * boots without the workbench provider to keep the suite lean.
 */
final class WorkbenchConfig
{
    /**
     * @return array<string, mixed>
     */
    public static function lattice(): array
    {
        return [
            'lattice.discover' => [__DIR__],
            'lattice.trees.middleware' => ['web'],
            'lattice.actions.middleware' => ['web'],
        ];
    }
}

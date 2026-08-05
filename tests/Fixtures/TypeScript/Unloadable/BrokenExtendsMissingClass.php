<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\TypeScript\Unloadable;

use Lattice\Tests\Fixtures\TypeScript\Unloadable\NonInstalledDependency\MissingBase;

/**
 * Simulates a class whose parent lives in an optional (e.g. require-dev)
 * dependency that isn't installed — autoloading it throws a fatal Error.
 */
class BrokenExtendsMissingClass extends MissingBase {}

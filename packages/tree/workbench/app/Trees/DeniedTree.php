<?php
declare(strict_types=1);

namespace Workbench\App\Trees;

use Illuminate\Http\Request;
use Lattice\Tree\AsTree;
use Lattice\Tree\CallbackTreeSource;
use Lattice\Tree\TreeDefinition;
use Lattice\Tree\TreeSource;

#[AsTree('denied')]
final class DeniedTree extends TreeDefinition
{
    public function authorize(Request $request): bool
    {
        return false;
    }

    public function source(): TreeSource
    {
        return new CallbackTreeSource(roots: static fn (): array => []);
    }
}

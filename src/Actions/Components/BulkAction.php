<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions\Components;

use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Attributes\AsComponent;

#[AsComponent('bulkAction')]
class BulkAction extends Action
{
    /**
     * @param  class-string<BulkActionDefinition>  $action
     */
    #[\Override]
    public static function use(string $action): static
    {
        /** @var static $registered */
        $registered = app(BulkActionRegistry::class)->component($action);

        return clone $registered;
    }
}

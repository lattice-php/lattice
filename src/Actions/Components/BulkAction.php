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
     * @param  array<string, mixed>  $context
     */
    #[\Override]
    public static function use(string $action, array $context = []): static
    {
        /** @var static $registered */
        $registered = app(BulkActionRegistry::class)->component($action, $context);

        return clone $registered;
    }
}

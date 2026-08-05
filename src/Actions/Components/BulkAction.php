<?php
declare(strict_types=1);

namespace Lattice\Actions\Components;

use Lattice\Actions\BulkActionDefinition;
use Lattice\Actions\BulkActionRegistry;
use Lattice\Core\Attributes\AsComponent;

#[AsComponent('action.bulk')]
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

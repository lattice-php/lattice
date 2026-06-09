<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Components\Core;

use Bambamboole\Lattice\Actions\BulkActionDefinition;
use Bambamboole\Lattice\Actions\BulkActionRegistry;

class BulkAction extends Action
{
    /**
     * @param  class-string<BulkActionDefinition>  $action
     */
    public static function use(string $action): static
    {
        $registered = app(BulkActionRegistry::class)->component($action);

        return (new static)
            ->id($registered->id)
            ->props($registered->props);
    }

    #[\Override]
    protected function type(): string
    {
        return 'bulkAction';
    }
}

<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Components\Core;

use Bambamboole\Lattice\Actions\BulkActionDefinition;
use Bambamboole\Lattice\Actions\BulkActionRegistry;

final class BulkAction
{
    /**
     * @param  class-string<BulkActionDefinition>  $action
     */
    public static function use(string $action): Action
    {
        return app(BulkActionRegistry::class)->component($action);
    }
}

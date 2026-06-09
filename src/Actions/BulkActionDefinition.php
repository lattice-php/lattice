<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Contracts\ProvidesBulkAction;
use Bambamboole\Lattice\Core\Components\Action;
use Bambamboole\Lattice\Definition;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

abstract class BulkActionDefinition extends Definition implements ProvidesBulkAction
{
    abstract public function definition(Action $action): Action;

    /**
     * @param  Collection<int, mixed>  $records
     */
    abstract public function handle(Collection $records, Request $request): ActionResult;
}

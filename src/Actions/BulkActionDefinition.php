<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Concerns\ValidatesActionForm;
use Lattice\Lattice\Actions\Contracts\ProvidesBulkAction;
use Lattice\Lattice\Core\Definition;

abstract class BulkActionDefinition extends Definition implements ProvidesBulkAction
{
    use ValidatesActionForm;

    abstract public function definition(Action $action): Action;

    /**
     * @param  Collection<int, mixed>  $records
     */
    abstract public function handle(Collection $records, Request $request): ActionResult;
}

<?php
declare(strict_types=1);

namespace Lattice\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Actions\Components\Action;
use Lattice\Actions\Concerns\InteractsWithActionForm;
use Lattice\Actions\Contracts\InteractsWithForm;
use Lattice\Core\Definition;

abstract class BulkActionDefinition extends Definition implements InteractsWithForm
{
    use InteractsWithActionForm;

    abstract public function definition(Action $action): Action;

    /**
     * @param  Collection<int, mixed>  $records
     */
    abstract public function handle(Collection $records, Request $request): ActionResult;
}

<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Concerns\InteractsWithActionForm;
use Lattice\Lattice\Actions\Contracts\InteractsWithForm;
use Lattice\Lattice\Core\Definition;

abstract class ActionDefinition extends Definition implements InteractsWithForm
{
    use InteractsWithActionForm;

    abstract public function definition(Action $action): Action;

    abstract public function handle(Request $request): ActionResult;
}

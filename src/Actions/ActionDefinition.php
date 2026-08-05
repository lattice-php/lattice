<?php
declare(strict_types=1);

namespace Lattice\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\Components\Action;
use Lattice\Actions\Concerns\InteractsWithActionForm;
use Lattice\Actions\Contracts\InteractsWithForm;
use Lattice\Core\Definition;

abstract class ActionDefinition extends Definition implements InteractsWithForm
{
    use InteractsWithActionForm;

    abstract public function definition(Action $action): Action;

    abstract public function handle(Request $request): ActionResult;
}

<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Components\Action;
use Illuminate\Http\Request;

abstract class ActionDefinition
{
    abstract public function definition(Action $action): Action;

    abstract public function handle(Request $request): ActionResult;
}

<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Components\Core\Action;
use Bambamboole\Lattice\Definition;
use Illuminate\Http\Request;

abstract class ActionDefinition extends Definition
{
    abstract public function definition(Action $action): Action;

    abstract public function handle(Request $request): ActionResult;
}

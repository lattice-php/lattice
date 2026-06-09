<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Actions\Components\Action;
use Bambamboole\Lattice\Contracts\ProvidesAction;
use Bambamboole\Lattice\Core\Definition;
use Illuminate\Http\Request;

abstract class ActionDefinition extends Definition implements ProvidesAction
{
    abstract public function definition(Action $action): Action;

    abstract public function handle(Request $request): ActionResult;
}

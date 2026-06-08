<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Components\Core\Action;
use Illuminate\Http\Request;

abstract class ActionDefinition
{
    abstract public function definition(Action $action): Action;

    abstract public function handle(Request $request): ActionResult;

    public function authorize(Request $request): bool
    {
        return true;
    }
}

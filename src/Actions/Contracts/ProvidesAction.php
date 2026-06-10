<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Contracts;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action;

interface ProvidesAction
{
    public function definition(Action $action): Action;

    public function handle(Request $request): ActionResult;
}

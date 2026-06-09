<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Contracts;

use Bambamboole\Lattice\Actions\ActionResult;
use Bambamboole\Lattice\Components\Core\Action;
use Illuminate\Http\Request;

interface ProvidesAction
{
    public function definition(Action $action): Action;

    public function handle(Request $request): ActionResult;
}

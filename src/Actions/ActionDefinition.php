<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Concerns\InteractsWithActionForm;
use Lattice\Lattice\Actions\Contracts\InteractsWithForm;
use Lattice\Lattice\Actions\Contracts\ProvidesAction;
use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Forms\Contracts\HandlesUploads;

abstract class ActionDefinition extends Definition implements HandlesUploads, InteractsWithForm, ProvidesAction
{
    use InteractsWithActionForm;

    abstract public function definition(Action $action): Action;

    abstract public function handle(Request $request): ActionResult;
}

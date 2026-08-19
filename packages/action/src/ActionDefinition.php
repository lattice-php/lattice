<?php
declare(strict_types=1);

namespace Lattice\Actions;

use Lattice\Actions\Components\Action;
use Lattice\Actions\Concerns\InteractsWithActionForm;
use Lattice\Core\Definition;
use Lattice\Form\Contracts\InteractsWithForm;

/**
 * A concrete action declares a public `handle()` method with a flexible
 * signature — parameters resolve by name (`$data` for the validated
 * `FormData`, `$request` for the current `Request`), by type (`FormData`,
 * `Request`), or fall back to the container. It must return an `ActionResult`,
 * e.g.:
 *
 *     public function handle(FormData $data): ActionResult
 */
abstract class ActionDefinition extends Definition implements InteractsWithForm
{
    use InteractsWithActionForm;

    abstract public function definition(Action $action): Action;
}

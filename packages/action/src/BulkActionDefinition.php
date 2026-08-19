<?php
declare(strict_types=1);

namespace Lattice\Actions;

use Lattice\Actions\Components\Action;
use Lattice\Actions\Concerns\InteractsWithActionForm;
use Lattice\Core\Definition;
use Lattice\Form\Contracts\InteractsWithForm;

/**
 * A concrete bulk action declares a public `handle()` method with a flexible
 * signature — parameters resolve by name (`$records` for the selected rows,
 * `$data` for the validated `FormData`, `$request` for the current
 * `Request`), by type (`Collection`, `FormData`, `Request`), or fall back to
 * the container. `$records`/`Collection` is bulk-only. It must return an
 * `ActionResult`, e.g.:
 *
 *     public function handle(Collection $records, FormData $data): ActionResult
 */
abstract class BulkActionDefinition extends Definition implements InteractsWithForm
{
    use InteractsWithActionForm;

    abstract public function definition(Action $action): Action;
}

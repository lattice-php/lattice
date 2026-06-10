<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions\Contracts;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action;

interface ProvidesBulkAction
{
    public function definition(Action $action): Action;

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, Request $request): ActionResult;
}

<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions\Contracts;

use Bambamboole\Lattice\Actions\ActionResult;
use Bambamboole\Lattice\Actions\Components\Action;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

interface ProvidesBulkAction
{
    public function definition(Action $action): Action;

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, Request $request): ActionResult;
}

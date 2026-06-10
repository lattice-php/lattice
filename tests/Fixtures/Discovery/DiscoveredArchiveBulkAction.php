<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\BulkAction;

#[BulkAction('fixtures.archive')]
class DiscoveredArchiveBulkAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action->label('Archive')->method('patch');
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, Request $request): ActionResult
    {
        return ActionResult::success(['archived' => $records->count()]);
    }
}

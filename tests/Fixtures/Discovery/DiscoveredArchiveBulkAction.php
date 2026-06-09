<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tests\Fixtures\Discovery;

use Bambamboole\Lattice\Actions\ActionResult;
use Bambamboole\Lattice\Actions\BulkActionDefinition;
use Bambamboole\Lattice\Actions\Components\Action;
use Bambamboole\Lattice\Attributes\BulkAction;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

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

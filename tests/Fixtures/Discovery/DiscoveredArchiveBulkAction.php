<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Discovery;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Actions\ActionResult;
use Lattice\Actions\BulkActionDefinition;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsBulkAction;
use Lattice\Ui\Enums\HttpMethod;

#[AsBulkAction('fixtures.archive')]
class DiscoveredArchiveBulkAction extends BulkActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action->label('Archive')->method(HttpMethod::Patch);
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, Request $request): ActionResult
    {
        return ActionResult::success(['archived' => $records->count()]);
    }
}

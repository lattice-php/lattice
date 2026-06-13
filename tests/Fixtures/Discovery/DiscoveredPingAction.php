<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Core\Enums\HttpMethod;

#[Action('fixtures.ping')]
class DiscoveredPingAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Ping')->method(HttpMethod::Post);
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success([
            'team' => data_get($request->input('context', []), 'team'),
        ]);
    }
}

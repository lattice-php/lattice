<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Discovery;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Ui\Enums\HttpMethod;

#[AsAction('fixtures.ping')]
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

<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tests\Fixtures\Discovery;

use Bambamboole\Lattice\Actions\ActionDefinition;
use Bambamboole\Lattice\Actions\ActionResult;
use Bambamboole\Lattice\Actions\Components\Action as ActionComponent;
use Bambamboole\Lattice\Attributes\Action;
use Illuminate\Http\Request;

#[Action('fixtures.ping')]
class DiscoveredPingAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Ping')->method('post');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success([
            'team' => data_get($request->input('context', []), 'team'),
        ]);
    }
}

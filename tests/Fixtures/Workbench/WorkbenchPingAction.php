<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Workbench;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Effects\Effect;

#[Action('workbench.ping')]
class WorkbenchPingAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label('Ping')
            ->method(HttpMethod::Post)
            ->variant(ButtonVariant::Secondary)
            ->effects([
                Effect::toast('Ready.'),
                Effect::reloadComponent('workbench.users'),
            ]);
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success([
            'handled' => $request->string('name')->toString(),
            'team' => data_get($request->input('context', []), 'team'),
        ])
            ->toast(Variant::Info, 'Action handled.')
            ->reloadComponent('workbench.users');
    }
}

<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Workbench;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\Enums\Variant;

#[AsAction('workbench.ping')]
class WorkbenchPingAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label('Ping')
            ->method(HttpMethod::Post)
            ->variant(Variant::Secondary);
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success([
            'handled' => $request->string('name')->toString(),
            'team' => $this->context('team'),
        ])
            ->toast('Action handled.', Variant::Info)
            ->reloadComponent('workbench.users');
    }
}

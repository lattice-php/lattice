<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Workbench;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Ui\Enums\ButtonVariant;
use Lattice\Lattice\Ui\Enums\HttpMethod;
use Lattice\Lattice\Ui\Enums\Variant;

#[AsAction('workbench.ping')]
class WorkbenchPingAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label('Ping')
            ->method(HttpMethod::Post)
            ->variant(ButtonVariant::Secondary);
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

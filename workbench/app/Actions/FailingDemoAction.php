<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Ui\Enums\HttpMethod;

#[AsAction('workbench.products.fail-demo')]
class FailingDemoAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label('Fail demo')
            ->method(HttpMethod::Patch)
            ->confirm('Fail demo?', 'This will be rejected.');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::failure('Could not process the request.');
    }
}

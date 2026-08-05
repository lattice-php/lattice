<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Ui\Enums\HttpMethod;

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

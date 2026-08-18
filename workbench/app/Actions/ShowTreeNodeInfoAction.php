<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Components\Text;

#[AsAction('workbench.tree.show-node-info')]
final class ShowTreeNodeInfoAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Show info')->icon('info');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success()->openModal(
            Modal::make('tree-node-info')
                ->title('Node info')
                ->description('Details about the selected node.')
                ->schema([
                    Text::make('This modal was opened from a tree node action.'),
                ]),
        );
    }
}

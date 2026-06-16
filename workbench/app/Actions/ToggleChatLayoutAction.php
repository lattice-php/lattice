<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Core\Enums\ButtonVariant;

#[AsAction('workbench.chat-layout.toggle')]
class ToggleChatLayoutAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->variant(ButtonVariant::Secondary);
    }

    public function handle(Request $request): ActionResult
    {
        $request->session()->put('workbench.chat_inline', ! $request->session()->get('workbench.chat_inline', false));

        return ActionResult::success()->reloadPage();
    }
}

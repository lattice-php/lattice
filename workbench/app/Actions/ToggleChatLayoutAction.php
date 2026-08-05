<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Ui\Enums\Variant;

#[AsAction('workbench.chat-layout.toggle')]
class ToggleChatLayoutAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->variant(Variant::Secondary);
    }

    public function handle(Request $request): ActionResult
    {
        $request->session()->put('workbench.chat_inline', ! $request->session()->get('workbench.chat_inline', false));

        return ActionResult::success()->reloadPage();
    }
}

<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Ui\Enums\Emphasis;

#[AsAction('workbench.logout')]
class LogoutAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->emphasis(Emphasis::Ghost);
    }

    public function handle(Request $request): ActionResult
    {
        Auth::guard()->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ActionResult::success()->toRoute('login');
    }
}

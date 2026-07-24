<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Ui\Enums\Emphasis;

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

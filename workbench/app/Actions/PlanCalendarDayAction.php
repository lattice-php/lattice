<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;

#[AsAction('workbench.calendar.plan-day')]
final class PlanCalendarDayAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action->label('Plan day');
    }

    public function handle(Request $request): ActionResult
    {
        /** @var array{date: string} $data */
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        return ActionResult::success($data)
            ->toast(__('workbench.calendar.day-planned', ['date' => $data['date']]));
    }
}

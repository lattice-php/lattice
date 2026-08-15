<?php
declare(strict_types=1);

namespace Workbench\App\Actions;

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;

#[AsAction('workbench.calendar.show-event')]
final class ShowCalendarEventAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action->label('Show event');
    }

    public function handle(Request $request): ActionResult
    {
        /** @var array{eventId: string} $data */
        $data = $request->validate([
            'eventId' => ['required', 'string'],
        ]);

        return ActionResult::success($data)
            ->toast(__('workbench.calendar.event-shown', ['event' => $data['eventId']]));
    }
}

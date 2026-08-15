<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Core\Contracts\SignsComponentReferences;

final readonly class CalendarController
{
    use InteractsWithComponents;

    public function __construct(
        private CalendarRegistry $calendars,
        private SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $calendar): JsonResponse
    {
        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->calendars, 'calendar', $calendar);

        $data = $request->isMethod('patch')
            ? $this->calendars->reschedule($request, $definition)
            : $this->calendars->response($calendar, $request, $definition);

        return response()->json($data);
    }
}

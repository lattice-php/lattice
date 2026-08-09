<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Core\Contracts\SignsComponentReferences;

final readonly class TimelineController
{
    use InteractsWithComponents;

    public function __construct(
        private TimelineRegistry $timelines,
        private SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $timeline): JsonResponse
    {
        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->timelines, 'timeline', $timeline);

        $data = $request->isMethod('patch')
            ? $this->timelines->reschedule($request, $definition)
            : $this->timelines->response($timeline, $request, $definition);

        return response()->json($data);
    }
}

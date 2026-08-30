<?php
declare(strict_types=1);

namespace Lattice\Board;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Core\Http\SubRequest;
use Lattice\Core\Http\SubRequestType;

final readonly class BoardController
{
    use InteractsWithComponents;

    public function __construct(
        private BoardRegistry $boards,
        private SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $board): JsonResponse
    {
        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->boards, 'board', $board);
        $sub = SubRequest::from($request);

        if ($sub?->type === SubRequestType::Search) {
            return response()->json($this->boards->searchFilterOptions($board, $request, $sub, $definition));
        }

        return response()->json($this->boards->response($board, $request, $definition));
    }
}

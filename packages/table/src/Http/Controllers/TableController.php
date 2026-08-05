<?php
declare(strict_types=1);

namespace Lattice\Table\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Core\Http\SubRequest;
use Lattice\Core\Http\SubRequestType;
use Lattice\Table\TableRegistry;

final readonly class TableController
{
    use InteractsWithComponents;

    public function __construct(
        private TableRegistry $tables,
        private SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $table): JsonResponse
    {
        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->tables, 'table', $table);
        $sub = SubRequest::from($request);

        if ($sub?->type === SubRequestType::Search) {
            return response()->json($this->tables->searchFilterOptions($table, $request, $sub, $definition));
        }

        return response()->json($this->tables->response($table, $request, $definition));
    }
}

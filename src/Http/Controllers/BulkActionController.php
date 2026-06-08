<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Actions\BulkActionRegistry;
use Bambamboole\Lattice\Concerns\InteractsWithLatticeComponents;
use Bambamboole\Lattice\Exceptions\UnknownLatticeComponent;
use Bambamboole\Lattice\Security\ComponentReferenceSigner;
use Bambamboole\Lattice\Tables\TableDefinition;
use Bambamboole\Lattice\Tables\TableRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BulkActionController
{
    use InteractsWithLatticeComponents;

    public function __construct(
        private readonly BulkActionRegistry $bulkActions,
        private readonly TableRegistry $tables,
        private readonly ComponentReferenceSigner $references,
    ) {}

    public function __invoke(Request $request, string $bulkAction): JsonResponse
    {
        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->bulkActions, 'bulkAction', $bulkAction);

        $table = $this->resolveTable($request);

        abort_unless($table->authorize($request), 403);

        $records = $table->resolveSelection($this->selectedKeys($request));

        return response()->json($definition->handle($records, $request)->toArray());
    }

    private function resolveTable(Request $request): TableDefinition
    {
        $key = data_get($request->input('context', []), 'table');

        abort_unless(is_string($key), 422);

        try {
            return $this->tables->resolve($key);
        } catch (UnknownLatticeComponent) {
            abort(404);
        }
    }

    /**
     * @return array<int, mixed>
     */
    private function selectedKeys(Request $request): array
    {
        $selected = $request->input('selected', []);

        return is_array($selected) ? array_values($selected) : [];
    }
}

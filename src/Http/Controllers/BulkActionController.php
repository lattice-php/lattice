<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Http\Controllers;

use Bambamboole\Lattice\Actions\BulkActionRegistry;
use Bambamboole\Lattice\Concerns\InteractsWithLatticeComponents;
use Bambamboole\Lattice\Exceptions\UnknownLatticeComponent;
use Bambamboole\Lattice\Security\ComponentReferenceSigner;
use Bambamboole\Lattice\Tables\InvalidTableQuery;
use Bambamboole\Lattice\Tables\TableDefinition;
use Bambamboole\Lattice\Tables\TableQuery;
use Bambamboole\Lattice\Tables\TableRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

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

        $tableKey = $this->trustedTableKey($request);
        $table = $this->resolveTable($tableKey);

        abort_unless($table->authorize($request), 403);

        try {
            $records = $this->resolveRecords($request, $table, $tableKey);
        } catch (InvalidTableQuery $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => $exception->errors,
            ], 422);
        }

        return response()->json($definition->handle($records, $request)->toArray());
    }

    /**
     * @return Collection<int, mixed>
     */
    private function resolveRecords(Request $request, TableDefinition $table, string $tableKey): Collection
    {
        if ($request->boolean('allMatching')) {
            return $table->resolveMatching(
                TableQuery::fromRequest($request, $table->columns(), $tableKey, $table->perPage()),
            );
        }

        return $table->resolveSelection($this->selectedKeys($request));
    }

    private function trustedTableKey(Request $request): string
    {
        $key = data_get($request->input('context', []), 'table');

        abort_unless(is_string($key), 422);

        return $key;
    }

    private function resolveTable(string $key): TableDefinition
    {
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

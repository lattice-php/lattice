<?php

declare(strict_types=1);

namespace Lattice\Lattice\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Core\Concerns\InteractsWithLatticeComponents;
use Lattice\Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Lattice\Core\Exceptions\UnknownLatticeComponent;
use Lattice\Lattice\Http\Controllers\Concerns\HandlesFormSubRequests;
use Lattice\Lattice\Http\Controllers\Concerns\HandlesPrecognition;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableRegistry;
use Symfony\Component\HttpFoundation\Response;

final class BulkActionController
{
    use HandlesFormSubRequests;
    use HandlesPrecognition;
    use InteractsWithLatticeComponents;

    public function __construct(
        private readonly BulkActionRegistry $bulkActions,
        private readonly TableRegistry $tables,
        private readonly SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $bulkAction): Response
    {
        $this->markPrecognitive($request);

        [$request, $definition] = $this->authorizeComponent($request, $this->references, $this->bulkActions, 'bulkAction', $bulkAction);

        if (($response = $this->formSubRequest($request, $definition)) !== null) {
            return $response;
        }

        if ($request->isPrecognitive()) {
            return $this->validatePrecognitive($request, fn () => $definition->validate($request));
        }

        $tableKey = $this->trustedTableKey($request);
        $table = $this->resolveTable($tableKey);

        abort_unless($table->authorize($request), 403);

        $records = $this->resolveRecords($request, $table, $tableKey);

        return response()->json($definition->handle($records, $request));
    }

    /**
     * @return Collection<int, mixed>
     */
    private function resolveRecords(Request $request, TableDefinition $table, string $tableKey): Collection
    {
        $source = $table->source();

        if ($request->boolean('allMatching')) {
            return $source->resolveMatching(
                TableQuery::fromRequest($request, $table->columns(), $tableKey, $table->perPage()),
            );
        }

        return $source->resolveSelection($this->selectedKeys($request));
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

<?php
declare(strict_types=1);

namespace Lattice\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Actions\ActionResult;
use Lattice\Actions\BulkActionRegistry;
use Lattice\Core\Authorization;
use Lattice\Core\Concerns\InteractsWithComponents;
use Lattice\Core\Contracts\SignsComponentReferences;
use Lattice\Core\Exceptions\UnknownComponent;
use Lattice\Form\FormData;
use Lattice\Form\Http\Controllers\Concerns\HandlesFormSubRequests;
use Lattice\Form\Http\Controllers\Concerns\HandlesPrecognition;
use Lattice\Form\Http\Controllers\Concerns\InvokesHandleMethod;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableRegistry;
use LogicException;
use Symfony\Component\HttpFoundation\Response;

final readonly class BulkActionController
{
    use HandlesFormSubRequests;
    use HandlesPrecognition;
    use InteractsWithComponents;
    use InvokesHandleMethod;

    public function __construct(
        private BulkActionRegistry $bulkActions,
        private TableRegistry $tables,
        private SignsComponentReferences $references,
    ) {}

    public function __invoke(Request $request, string $bulkAction): Response
    {
        $this->markPrecognitive($request);

        [$request, $definition, $context] = $this->authorizeComponent($request, $this->references, $this->bulkActions, 'action.bulk', $bulkAction);

        if (($response = $this->formSubRequest($request, $definition)) instanceof Response) {
            return $response;
        }

        if ($request->isPrecognitive()) {
            return $this->validatePrecognitive($request, fn (): FormData => $definition->validate($request));
        }

        $tableKey = $this->trustedTableKey($context);
        $table = $this->resolveTable($tableKey)->withContext($context);

        Authorization::ensure($table, $request);

        $data = $definition->validate($request);

        $records = $this->resolveRecords($request, $table, $tableKey);

        $result = $this->invokeHandle($definition, $request, $data, $records);

        if (! $result instanceof ActionResult) {
            throw new LogicException(sprintf('%s::handle() must return an %s.', $definition::class, ActionResult::class));
        }

        return response()->json($result, $result->status());
    }

    /**
     * @return Collection<int, mixed>
     */
    private function resolveRecords(Request $request, TableDefinition $table, string $tableKey): Collection
    {
        $source = $table->source();

        if ($request->boolean('allMatching')) {
            return $source->resolveMatching(
                TableQuery::fromRequest(
                    $request,
                    $table->columns(),
                    $tableKey,
                    $table->perPage(),
                    $table->filters(),
                    $table->perPageOptions(),
                ),
            );
        }

        return $source->resolveSelection($this->selectedKeys($request));
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function trustedTableKey(array $context): string
    {
        $key = data_get($context, 'table');

        abort_unless(is_string($key), 422);

        return $key;
    }

    private function resolveTable(string $key): TableDefinition
    {
        try {
            return $this->tables->resolve($key);
        } catch (UnknownComponent) {
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

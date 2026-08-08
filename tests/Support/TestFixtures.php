<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Lattice\Core\Contracts\OptionSource;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Core\Http\SubRequest;
use Lattice\Core\Option;
use Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Form\Components\Form;
use Lattice\Form\Components\RowsField;
use Lattice\Form\FormDefinition;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Ui\Contracts\SchemaEntry;
use Symfony\Component\HttpFoundation\Response;

/**
 * Spreadable request-plus-envelope pair for calling sub-request methods
 * directly: `->searchOptions(...subRequest(Request::create(...)))`.
 *
 * @return array{0: Request, 1: SubRequest}
 */
function subRequest(Request $request): array
{
    $sub = SubRequest::from($request);

    if (! $sub instanceof SubRequest) {
        throw new RuntimeException('The request does not carry a sub-request envelope.');
    }

    return [$request, $sub];
}

function discoverFixtures(): void
{
    config(['lattice.discover' => [
        dirname(__DIR__).'/Fixtures/Discovery',
    ]]);

    app(DiscoveryManifest::class)->clear();
}

/**
 * @return array<array-key, mixed>
 */
function wire(mixed $value): array
{
    return json_decode(json_encode($value, JSON_THROW_ON_ERROR), true);
}

function wireJson(mixed $value): string
{
    return json_encode($value, JSON_THROW_ON_ERROR);
}

/**
 * @param  array<int|string, string>  $people
 */
function inMemoryOptionSource(array $people): OptionSource
{
    return new class($people) implements OptionSource
    {
        /**
         * @param  array<int|string, string>  $people
         */
        public function __construct(private array $people) {}

        public function search(string $query): array
        {
            $matches = $query === ''
                ? $this->people
                : array_filter($this->people, fn (string $name): bool => str_contains(strtolower($name), strtolower($query)));

            return array_map(fn (string $name, int|string $id): Option => new Option($name, (string) $id), $matches, array_keys($matches));
        }

        public function selected(array $values): array
        {
            return array_map(fn (string $id): Option => new Option($this->people[$id] ?? $id, $id), $values);
        }
    };
}

function fixturePath(string $name): string
{
    return dirname(__DIR__).'/Fixtures/'.$name;
}

/**
 * @param  Closure(): array<int, SchemaEntry>  $schema
 */
function testFormDefinition(Closure $schema): FormDefinition
{
    return new class($schema) extends FormDefinition
    {
        public function __construct(private readonly Closure $schema) {}

        public function definition(Form $form, Request $request): Form
        {
            return $form->schema(($this->schema)());
        }

        public function handle(Request $request): Response
        {
            return new Response('ok');
        }
    };
}

/**
 * @param  array<string, mixed>  $context
 */
function sealedRef(string $type, string $key, array $context = []): string
{
    return app(ComponentReferenceSigner::class)->seal($type, $key, $context);
}

/**
 * @param  array<string, mixed>  $payload
 * @return array<string, array<int, string>>
 */
function validationErrors(FormDefinition $definition, array $payload = []): array
{
    try {
        $definition->validate(Request::create('/', 'POST', $payload));
    } catch (ValidationException $exception) {
        return $exception->errors();
    }

    return [];
}

/**
 * @param  array<string, string>  $params
 * @return array<int, array<string, mixed>>
 */
function tableRows(TableDefinition $table, array $params = []): array
{
    $query = TableQuery::fromRequest(
        Request::create('/', 'GET', $params),
        $table->columns(),
        'table',
    );

    return $table->source()->query($query)->data;
}

/**
 * @param  array<int|string, mixed>  $rows
 * @return array<int|string, mixed>
 */
function withoutRowIds(array $rows): array
{
    unset($rows[RowsField::ROW_ID]);

    return array_map(
        static fn (mixed $value): mixed => is_array($value) ? withoutRowIds($value) : $value,
        $rows,
    );
}

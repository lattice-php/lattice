<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Lattice\Support\JsonSchema\JsonSchemaBuilder;
use Lattice\Support\JsonSchema\SchemaBundler;
use Lattice\Support\JsonSchema\WireSource;
use Lattice\Support\JsonSchema\WireSourceCatalog;
use Opis\JsonSchema\Validator;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * @return array<string, mixed>
 */
function schemaBundle(): array
{
    $catalog = WireSourceCatalog::fromApplication();

    return new SchemaBundler()->bundle($catalog->discover(), []);
}

/**
 * @param  array<string, mixed>  $bundle
 */
function bundleValidator(array $bundle): Validator
{
    $validator = new Validator;
    $validator->resolver()?->registerRaw(
        json_decode((string) json_encode($bundle)),
        $bundle['$id'],
    );

    return $validator;
}

it('embeds every wire package under $defs/{shortName}, retaining each document\'s own $id', function (): void {
    $bundle = schemaBundle();

    expect($bundle['$id'])->toBe('https://lattice-php.dev/schema/lattice/v1.json')
        ->and($bundle['$defs'])->toHaveKeys(['core', 'ui', 'form', 'table', 'action', 'tree']);

    foreach (['core', 'ui', 'form', 'table', 'action', 'tree'] as $shortName) {
        expect($bundle['$defs'][$shortName]['$id'])->toBe("https://lattice-php.dev/schema/{$shortName}/v1.json");
    }
});

it('validates a real workbench page payload against the bundle', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    $page = get('/')->assertOk()->viewData('page');

    $bundle = schemaBundle();
    $result = bundleValidator($bundle)->validate(
        json_decode((string) json_encode($page['props']['lattice'])),
        $bundle['$id'].'#/$defs/PagePayload',
    );

    expect($result->isValid())->toBeTrue();
});

it('validates an embedded node against its own document through the bundle', function (): void {
    $bundle = schemaBundle();
    $validator = bundleValidator($bundle);

    $result = $validator->validate(
        json_decode((string) json_encode(['type' => 'button', 'props' => [
            'action' => null, 'buttonType' => 'button', 'effects' => [], 'emphasis' => null,
            'href' => null, 'icon' => null, 'label' => 'Save', 'method' => null, 'variant' => null,
        ]])),
        $bundle['$id'].'#/$defs/ui/$defs/node:button',
    );

    expect($result->isValid())->toBeTrue();
});

it('reads an installed package\'s COMMITTED schema file, never reflecting its PHP', function (): void {
    $catalog = WireSourceCatalog::fromApplication();
    $table = collect($catalog->discover())->firstWhere('shortName', 'table');
    $original = File::get($table->schemaPath());

    try {
        $doctored = json_decode($original, true);
        $doctored['$defs'] = ['Doctored' => ['type' => 'string']];
        File::put($table->schemaPath(), json_encode($doctored));

        $bundle = new SchemaBundler()->bundle($catalog->discover(), []);

        expect($bundle['$defs']['table']['$defs'])->toBe(['Doctored' => ['type' => 'string']])
            ->and($bundle['$defs']['table']['$defs'])->not->toHaveKey('Column');
    } finally {
        File::put($table->schemaPath(), $original);
    }
});

it('embeds the root document when the app declares its own wire surface, resolving app-only sources without reflecting vendor PHP', function (): void {
    withScaffoldWorkspace(function (string $basePath): void {
        $catalog = WireSourceCatalog::fromApplication()->withRoot(
            ['name' => 'acme/app', 'extra' => ['lattice' => ['discover' => ['.']]]],
            dirname(__DIR__, 2).'/Fixtures/TypeScript',
        );

        $sources = $catalog->discover();
        $root = collect($sources)->firstWhere('isRoot', true);
        $installed = array_values(array_filter($sources, fn (WireSource $source): bool => ! $source->isRoot));

        $rootDocument = new JsonSchemaBuilder($catalog)->buildRootDocument($root, $installed);
        $bundle = new SchemaBundler()->bundle($sources, $rootDocument);

        expect($bundle['$defs'])->toHaveKey('app')
            ->and($bundle['$defs']['app']['$defs'])->toHaveKey('SampleComponent');
    });
});

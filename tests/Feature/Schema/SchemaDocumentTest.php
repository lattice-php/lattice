<?php
declare(strict_types=1);

use Opis\JsonSchema\Validator;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

/**
 * @return array<string, mixed>
 */
function schemaDocument(): array
{
    static $document = null;

    return $document ??= json_decode(
        (string) file_get_contents(dirname(__DIR__, 3).'/resources/schema/lattice.schema.json'),
        true,
    );
}

function schemaValidator(): Validator
{
    $validator = new Validator;
    $validator->resolver()?->registerFile(
        'https://lattice-php.dev/schema/v1.json',
        dirname(__DIR__, 3).'/resources/schema/lattice.schema.json',
    );

    return $validator;
}

function validateAgainst(string $pointer, mixed $data): bool
{
    return schemaValidator()
        ->validate(json_decode((string) json_encode($data)), 'https://lattice-php.dev/schema/v1.json#/$defs/'.$pointer)
        ->isValid();
}

it('validates a real workbench page payload against the PagePayload entry point', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    $page = get('/')->assertOk()->viewData('page');

    expect(validateAgainst('PagePayload', $page['props']['lattice']))->toBeTrue();
});

it('accepts a well-formed remote manifest', function (): void {
    $manifest = [
        [
            'type' => 'remote.data-list',
            'id' => 'todos',
            'props' => ['audience' => 'todos-api', 'dataEndpoint' => 'https://api.example.com/todos'],
            'schema' => [
                ['type' => 'badge', 'props' => ['label' => 'Open']],
            ],
        ],
    ];

    expect(validateAgainst('RemoteManifest', $manifest))->toBeTrue()
        ->and(validateAgainst('RemoteManifest', ['version' => 1, 'schema' => $manifest]))->toBeTrue();
});

it('rejects a remote manifest smuggling server-trusted props or missing its audience', function (): void {
    $forbiddenRef = [[
        'type' => 'remote.data-list',
        'id' => 'todos',
        'props' => ['audience' => 'todos-api', 'ref' => 'forged'],
    ]];

    $missingAudience = [[
        'type' => 'remote.data-list',
        'id' => 'todos',
        'props' => ['dataEndpoint' => 'https://api.example.com/todos'],
    ]];

    expect(validateAgainst('RemoteManifest', $forbiddenRef))->toBeFalse()
        ->and(validateAgainst('RemoteManifest', $missingAudience))->toBeFalse();
});

it('rejects a node whose props violate its type schema', function (): void {
    expect(validateAgainst('node:button', [
        'type' => 'button',
        'props' => ['label' => 'Save'],
    ]))->toBeFalse()
        ->and(validateAgainst('ComponentNode', [
            'type' => 'not-a-real-type',
            'props' => [],
        ]))->toBeFalse();
});

it('covers every type the generated TypeScript module exports', function (): void {
    $document = schemaDocument();

    $generated = (string) file_get_contents(dirname(__DIR__, 3).'/resources/js/types/generated.ts');
    $generatedShapes = explode('// ─── Generated shapes', $generated, 2)[1];

    preg_match_all('/^export type (\w+)/m', $generatedShapes, $matches);

    $synthesized = array_keys($document['x-lattice']['domains']);

    foreach ($document['x-lattice']['families'] as $family) {
        $synthesized[] = $family['propsMap'];
    }

    $allowed = [...array_keys($document['$defs']), ...$synthesized];
    $missing = array_diff($matches[1], $allowed);

    expect(array_values($missing))->toBe([]);
});

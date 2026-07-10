<?php
declare(strict_types=1);

use Illuminate\Contracts\Container\Container;
use Illuminate\Support\Facades\Http;
use Lattice\Lattice\Core\Exceptions\UnknownComponent;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Remote\RemoteSchemaEndpoint;
use Lattice\Lattice\Remote\RemoteSourceDefinition;
use Lattice\Lattice\Tests\Fixtures\Remote\DynamicExternalAppRemoteSource;
use Lattice\Lattice\Tests\Fixtures\Remote\DynamicExternalAppStore;
use Lattice\Lattice\Ui\Components\Component;

function registerDynamicExternalAppSource(string $sourceKey, RemoteSchemaEndpoint $schemaEndpoint): void
{
    $store = new DynamicExternalAppStore;
    $store->register($sourceKey, $schemaEndpoint, 'dynamic-token-for-'.$sourceKey);
    app()->instance(DynamicExternalAppStore::class, $store);

    Lattice::remoteSourceResolver(
        fn (string $candidate, Container $container): ?DynamicExternalAppRemoteSource => $candidate === $sourceKey
            ? $container->make(DynamicExternalAppRemoteSource::class, ['sourceKey' => $candidate])
            : null,
    );
}

test('dynamic remote source keys are injected into schema refs', function (): void {
    $this->actingAs(workbenchTestUser());

    Http::preventStrayRequests();
    Http::fake([
        'https://acme.example.test/schema.json' => Http::response([
            'schema' => [
                [
                    'type' => 'remote.data-list',
                    'id' => 'tickets',
                    'props' => [
                        'dataEndpoint' => 'https://acme.example.test/tickets',
                        'audience' => 'https://acme.example.test',
                        'scopes' => ['tickets.read'],
                    ],
                ],
            ],
        ]),
    ]);

    registerDynamicExternalAppSource(
        'external-app:acme',
        RemoteSchemaEndpoint::url('https://acme.example.test/schema.json', allowedHosts: ['acme.example.test']),
    );

    $wire = wire(Lattice::remoteSourceRegistry()
        ->resolve('external-app:acme')
        ->schema(request()));

    expect($wire[0]['type'])->toBe('remote.data-list')
        ->and($wire[0]['props']['remote']['source'])->toBe('external-app:acme')
        ->and($wire[0]['props']['remote']['audience'])->toBe('https://acme.example.test')
        ->and($wire[0]['props']['remote']['scopes'])->toBe(['tickets.read'])
        ->and($wire[0]['props']['remote']['nodeId'])->toBe('tickets')
        ->and($wire[0]['props']['remote']['tokenEndpoint'])->toBe('/lattice/remote-sources/external-app%3Aacme/token')
        ->and($wire[0]['props']['remote']['ref'])->toBeString()->not->toBe('');
});

test('dynamic remote source keys resolve the same source during token exchange', function (): void {
    $this->actingAs(workbenchTestUser());

    registerDynamicExternalAppSource(
        'external-app:acme',
        RemoteSchemaEndpoint::url('https://acme.example.test/schema.json', allowedHosts: ['acme.example.test']),
    );

    $ref = app(ComponentReferenceSigner::class)->seal('remote.data-list', 'tickets', [
        'audience' => 'https://acme.example.test',
        'source' => 'external-app:acme',
        'scopes' => ['tickets.read'],
    ]);

    $response = $this->postJson('/lattice/remote-sources/'.rawurlencode('external-app:acme').'/token', [
        'nodeId' => 'tickets',
        'nodeType' => 'remote.data-list',
        'audience' => 'https://acme.example.test',
        'scopes' => ['tickets.read'],
    ], latticeHeaders($ref));

    $response
        ->assertOk()
        ->assertJson([
            'accessToken' => 'dynamic-token-for-external-app:acme',
            'audience' => 'https://acme.example.test',
            'scopes' => ['tickets.read'],
        ]);
});

test('remote source definitions return no schema when no endpoint is configured', function (): void {
    $source = new class extends RemoteSourceDefinition {};

    expect($source->withSourceKey('external-app:empty')->schema(request()))->toBe([]);
});

test('remote source definitions normalize inline manifests with the dynamic source key', function (): void {
    $source = new class extends RemoteSourceDefinition
    {
        /**
         * @param  list<array<string, mixed>>  $manifest
         * @return list<Component>
         */
        public function manifest(array $manifest): array
        {
            return $this->schemaFromManifest($manifest);
        }
    };

    $wire = wire($source
        ->withSourceKey('external-app:inline')
        ->manifest([
            [
                'type' => 'text',
                'props' => ['text' => 'Inline remote schema'],
            ],
        ]));

    expect($wire[0])->toMatchArray([
        'type' => 'text',
        'props' => [
            'text' => 'Inline remote schema',
        ],
    ]);
});

test('dynamic remote source registry rejects unknown source keys', function (): void {
    Lattice::remoteSourceResolver(fn (string $candidate, Container $container): ?RemoteSourceDefinition => null);

    expect(fn () => Lattice::remoteSourceRegistry()->resolve('external-app:missing'))
        ->toThrow(UnknownComponent::class, 'external-app:missing');
});

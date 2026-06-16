<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Http;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Integrations\ExternalSchemaEndpoint;
use Lattice\Lattice\Integrations\InvalidExternalSchema;
use Lattice\Lattice\Tests\Fixtures\Discovery\RemoteSchemaIntegration;

afterEach(function (): void {
    RemoteSchemaIntegration::reset();
});

test('integration schema resolves an external schema endpoint and injects trusted browser token props', function (): void {
    $this->actingAs(workbenchTestUser());

    Http::preventStrayRequests();
    Http::fake([
        'https://crm.example.test/schema.json' => Http::response([
            'version' => 1,
            'schema' => [
                [
                    'type' => 'integration.browser-data',
                    'id' => 'customers',
                    'props' => [
                        'endpoint' => 'https://evil.example.test/token',
                        'tokenEndpoint' => 'https://evil.example.test/token',
                        'ref' => 'forged-ref',
                        'dataEndpoint' => 'https://crm.example.test/customers',
                        'audience' => 'https://crm.example.test',
                        'scopes' => ['customers.read'],
                        'resource' => 'customers',
                    ],
                ],
            ],
        ]),
    ]);

    Lattice::integrations([RemoteSchemaIntegration::class]);
    RemoteSchemaIntegration::$endpoint = ExternalSchemaEndpoint::url(
        'https://crm.example.test/schema.json',
        allowedHosts: ['crm.example.test'],
    );

    $nodes = Lattice::integrationRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request());

    $wire = wire($nodes);

    expect($wire)->toHaveCount(1)
        ->and($wire[0]['type'])->toBe('integration.browser-data')
        ->and($wire[0]['id'])->toBe('customers')
        ->and($wire[0]['props']['endpoint'])->toBe('/lattice/integrations/fixtures.remote-crm/token')
        ->and($wire[0]['props']['tokenEndpoint'])->toBe('/lattice/integrations/fixtures.remote-crm/token')
        ->and($wire[0]['props']['dataEndpoint'])->toBe('https://crm.example.test/customers')
        ->and($wire[0]['props']['audience'])->toBe('https://crm.example.test')
        ->and($wire[0]['props']['scopes'])->toBe(['customers.read'])
        ->and($wire[0]['props']['ref'])->toBeString()->not->toBe('forged-ref');

    Http::assertSentCount(1);
    Http::assertSent(fn ($request): bool => $request->url() === 'https://crm.example.test/schema.json');
});

test('integration schema rejects endpoints outside allowed hosts before sending a request', function (): void {
    Http::preventStrayRequests();
    Http::fake();

    Lattice::integrations([RemoteSchemaIntegration::class]);
    RemoteSchemaIntegration::$endpoint = ExternalSchemaEndpoint::url(
        'https://evil.example.test/schema.json',
        allowedHosts: ['crm.example.test'],
    );

    expect(fn () => Lattice::integrationRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request())
    )->toThrow(InvalidExternalSchema::class, 'not allowed');

    Http::assertNothingSent();
});

test('integration schema resolves local json files for the workbench poc', function (): void {
    Lattice::integrations([RemoteSchemaIntegration::class]);

    $path = fixturePath('Integrations/remote-schema.json');
    RemoteSchemaIntegration::$endpoint = ExternalSchemaEndpoint::file($path);

    $wire = wire(Lattice::integrationRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request()));

    expect($wire[0]['type'])->toBe('integration.browser-data')
        ->and($wire[0]['props']['tokenEndpoint'])->toBe('/lattice/integrations/fixtures.remote-crm/token')
        ->and($wire[0]['props']['resource'])->toBe('fixture-customers');
});

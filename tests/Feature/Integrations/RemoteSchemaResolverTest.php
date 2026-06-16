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

test('integration schema resolves nested external nodes and injects trusted token props', function (): void {
    $this->actingAs(workbenchTestUser());

    Http::preventStrayRequests();
    Http::fake([
        'https://crm.example.test/schema.json' => Http::response([
            'version' => 1,
            'schema' => [
                [
                    'type' => 'section',
                    'id' => 'crm-overview',
                    'props' => [
                        'title' => 'CRM overview',
                        'endpoint' => 'https://evil.example.test/token',
                        'tokenEndpoint' => 'https://evil.example.test/token',
                        'ref' => 'forged-ref',
                    ],
                    'schema' => [
                        [
                            'type' => 'card',
                            'props' => ['title' => 'Customers'],
                            'schema' => [
                                [
                                    'type' => 'text',
                                    'props' => ['text' => 'External customer records'],
                                ],
                                [
                                    'type' => 'remote.data-list',
                                    'id' => 'customers',
                                    'props' => [
                                        'endpoint' => 'https://evil.example.test/token',
                                        'tokenEndpoint' => 'https://evil.example.test/token',
                                        'ref' => 'forged-ref',
                                        'remote' => ['ref' => 'forged-remote-ref'],
                                        'dataEndpoint' => 'https://crm.example.test/customers',
                                        'audience' => 'https://crm.example.test',
                                        'scopes' => ['customers.read'],
                                        'resource' => 'customers',
                                        'titleKey' => 'name',
                                        'subtitleKey' => 'email',
                                    ],
                                ],
                                [
                                    'type' => 'remote.external-chat-box',
                                    'id' => 'crm-chat',
                                    'props' => [
                                        'endpoint' => 'https://evil.example.test/token',
                                        'tokenEndpoint' => 'https://evil.example.test/token',
                                        'ref' => 'forged-ref',
                                        'remote' => ['ref' => 'forged-remote-ref'],
                                        'streamEndpoint' => 'https://crm.example.test/chat/stream',
                                        'historyEndpoint' => 'https://crm.example.test/chat/history',
                                        'audience' => 'https://crm.example.test',
                                        'scopes' => ['chat.read', 'chat.write'],
                                        'title' => 'CRM assistant',
                                    ],
                                ],
                            ],
                        ],
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

    $request = request();
    $request->headers->set('Accept-Language', 'de-CH,de;q=0.9,en;q=0.8');

    $nodes = Lattice::integrationRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema($request);

    $wire = wire($nodes);

    expect($wire)->toHaveCount(1)
        ->and($wire[0]['type'])->toBe('section')
        ->and($wire[0]['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'ref'])
        ->and($wire[0]['schema'][0]['type'])->toBe('card')
        ->and($wire[0]['schema'][0]['schema'][0]['type'])->toBe('text');

    $dataList = $wire[0]['schema'][0]['schema'][1];
    $chatBox = $wire[0]['schema'][0]['schema'][2];

    expect($dataList['type'])->toBe('remote.data-list')
        ->and($dataList['id'])->toBe('customers')
        ->and($dataList['props']['dataEndpoint'])->toBe('https://crm.example.test/customers')
        ->and($dataList['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'audience', 'scopes', 'resource', 'ref'])
        ->and($dataList['props']['remote']['integration'])->toBe('fixtures.remote-crm')
        ->and($dataList['props']['remote']['audience'])->toBe('https://crm.example.test')
        ->and($dataList['props']['remote']['scopes'])->toBe(['customers.read'])
        ->and($dataList['props']['remote']['nodeId'])->toBe('customers')
        ->and($dataList['props']['remote']['nodeType'])->toBe('remote.data-list')
        ->and($dataList['props']['remote']['ref'])->toBeString()->not->toBe('forged-remote-ref');

    expect($chatBox['type'])->toBe('remote.external-chat-box')
        ->and($chatBox['id'])->toBe('crm-chat')
        ->and($chatBox['props']['streamEndpoint'])->toBe('https://crm.example.test/chat/stream')
        ->and($chatBox['props']['historyEndpoint'])->toBe('https://crm.example.test/chat/history')
        ->and($chatBox['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'audience', 'scopes', 'resource', 'ref'])
        ->and($chatBox['props']['remote']['integration'])->toBe('fixtures.remote-crm')
        ->and($chatBox['props']['remote']['audience'])->toBe('https://crm.example.test')
        ->and($chatBox['props']['remote']['scopes'])->toBe(['chat.read', 'chat.write'])
        ->and($chatBox['props']['remote']['nodeId'])->toBe('crm-chat')
        ->and($chatBox['props']['remote']['nodeType'])->toBe('remote.external-chat-box')
        ->and($chatBox['props']['remote']['ref'])->toBeString()->not->toBe('forged-remote-ref');

    Http::assertSentCount(1);
    Http::assertSent(fn ($request): bool => $request->url() === 'https://crm.example.test/schema.json'
        && $request->hasHeader('Accept-Language', 'de-CH,de;q=0.9,en;q=0.8'));
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

test('integration schema rejects external component urls outside allowed hosts', function (): void {
    Http::preventStrayRequests();
    Http::fake([
        'https://crm.example.test/schema.json' => Http::response([
            'schema' => [
                [
                    'type' => 'remote.data-list',
                    'id' => 'customers',
                    'props' => [
                        'dataEndpoint' => 'https://evil.example.test/customers',
                        'audience' => 'https://crm.example.test',
                        'scopes' => ['customers.read'],
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

    expect(fn () => Lattice::integrationRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request())
    )->toThrow(InvalidExternalSchema::class, 'not allowed');
});

test('integration schema resolves local json files for the workbench poc', function (): void {
    Lattice::integrations([RemoteSchemaIntegration::class]);

    $path = fixturePath('Integrations/remote-schema.json');
    RemoteSchemaIntegration::$endpoint = ExternalSchemaEndpoint::file($path);

    $wire = wire(Lattice::integrationRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request()));

    expect($wire[0]['type'])->toBe('remote.data-list')
        ->and($wire[0]['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'audience', 'scopes', 'resource', 'ref'])
        ->and($wire[0]['props']['remote']['integration'])->toBe('fixtures.remote-crm')
        ->and($wire[0]['props']['remote']['audience'])->toBe('https://crm.example.test')
        ->and($wire[0]['props']['remote']['scopes'])->toBe(['customers.read'])
        ->and($wire[0]['props']['remote']['nodeId'])->toBe('fixture-customers')
        ->and($wire[0]['props']['remote']['nodeType'])->toBe('remote.data-list')
        ->and($wire[0]['props']['remote']['ref'])->toBeString()->not->toBe('');
});

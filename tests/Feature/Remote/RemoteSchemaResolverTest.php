<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Http;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Remote\InvalidRemoteSchema;
use Lattice\Lattice\Remote\RemoteSchemaEndpoint;
use Lattice\Lattice\Tests\Fixtures\Discovery\RemoteSchemaSource;

afterEach(function (): void {
    RemoteSchemaSource::reset();
});

test('remote source schema resolves nested nodes and injects trusted token props', function (): void {
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
                                    'props' => ['text' => 'Remote customer records'],
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
                                    ],
                                    'schema' => [
                                        [
                                            'type' => 'card',
                                            'props' => [
                                                'dataBindings' => [
                                                    'title' => 'name',
                                                    'description' => 'email',
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                                [
                                    'type' => 'chat.box',
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

    Lattice::remoteSources([RemoteSchemaSource::class]);
    RemoteSchemaSource::$endpoint = RemoteSchemaEndpoint::url(
        'https://crm.example.test/schema.json',
        allowedHosts: ['crm.example.test'],
    );

    $request = request();
    $request->headers->set('Accept-Language', 'de-CH,de;q=0.9,en;q=0.8');

    $nodes = Lattice::remoteSourceRegistry()
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
        ->and($dataList['props']['remote']['source'])->toBe('fixtures.remote-crm')
        ->and($dataList['props']['remote']['audience'])->toBe('https://crm.example.test')
        ->and($dataList['props']['remote']['scopes'])->toBe(['customers.read'])
        ->and($dataList['props']['remote']['nodeId'])->toBe('customers')
        ->and($dataList['props']['remote']['nodeType'])->toBe('remote.data-list')
        ->and($dataList['props']['remote']['tokenEndpoint'])->toBe('/lattice/remote-sources/fixtures.remote-crm/token')
        ->and($dataList['props']['remote']['ref'])->toBeString()->not->toBe('forged-remote-ref');

    expect($dataList['schema'][0]['type'])->toBe('card')
        ->and($dataList['schema'][0]['props']['dataBindings'])->toBe([
            'title' => 'name',
            'description' => 'email',
        ]);

    expect($chatBox['type'])->toBe('chat.box')
        ->and($chatBox['id'])->toBe('crm-chat')
        ->and($chatBox['props']['streamEndpoint'])->toBe('https://crm.example.test/chat/stream')
        ->and($chatBox['props']['historyEndpoint'])->toBe('https://crm.example.test/chat/history')
        ->and($chatBox['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'audience', 'scopes', 'resource', 'ref'])
        ->and($chatBox['props']['remote']['source'])->toBe('fixtures.remote-crm')
        ->and($chatBox['props']['remote']['audience'])->toBe('https://crm.example.test')
        ->and($chatBox['props']['remote']['scopes'])->toBe(['chat.read', 'chat.write'])
        ->and($chatBox['props']['remote']['nodeId'])->toBe('crm-chat')
        ->and($chatBox['props']['remote']['nodeType'])->toBe('chat.box')
        ->and($chatBox['props']['remote']['tokenEndpoint'])->toBe('/lattice/remote-sources/fixtures.remote-crm/token')
        ->and($chatBox['props']['remote']['ref'])->toBeString()->not->toBe('forged-remote-ref');

    Http::assertSentCount(1);
    Http::assertSent(fn ($request): bool => $request->url() === 'https://crm.example.test/schema.json'
        && $request->hasHeader('Accept-Language', 'de-CH,de;q=0.9,en;q=0.8'));
});

test('source schema rejects endpoints outside allowed hosts before sending a request', function (): void {
    Http::preventStrayRequests();
    Http::fake();

    Lattice::remoteSources([RemoteSchemaSource::class]);
    RemoteSchemaSource::$endpoint = RemoteSchemaEndpoint::url(
        'https://evil.example.test/schema.json',
        allowedHosts: ['crm.example.test'],
    );

    expect(fn () => Lattice::remoteSourceRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request())
    )->toThrow(InvalidRemoteSchema::class, 'not allowed');

    Http::assertNothingSent();
});

test('source schema rejects endpoints without a host before sending a request', function (): void {
    Http::preventStrayRequests();
    Http::fake();

    Lattice::remoteSources([RemoteSchemaSource::class]);
    RemoteSchemaSource::$endpoint = RemoteSchemaEndpoint::url('/schema.json');

    expect(fn () => Lattice::remoteSourceRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request())
    )->toThrow(InvalidRemoteSchema::class, 'must include a host');

    Http::assertNothingSent();
});

test('remote source schema rejects component urls outside allowed hosts', function (): void {
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

    Lattice::remoteSources([RemoteSchemaSource::class]);
    RemoteSchemaSource::$endpoint = RemoteSchemaEndpoint::url(
        'https://crm.example.test/schema.json',
        allowedHosts: ['crm.example.test'],
    );

    expect(fn () => Lattice::remoteSourceRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request())
    )->toThrow(InvalidRemoteSchema::class, 'not allowed');
});

test('remote source schema allows relative component urls from a trusted schema endpoint', function (): void {
    Http::preventStrayRequests();
    Http::fake([
        'https://crm.example.test/schema.json' => Http::response([
            'schema' => [
                [
                    'type' => 'remote.data-list',
                    'id' => 'customers',
                    'props' => [
                        'dataEndpoint' => '/customers',
                        'audience' => 'https://crm.example.test',
                        'scopes' => ['customers.read'],
                    ],
                ],
            ],
        ]),
    ]);

    Lattice::remoteSources([RemoteSchemaSource::class]);
    RemoteSchemaSource::$endpoint = RemoteSchemaEndpoint::url(
        'https://crm.example.test/schema.json',
        allowedHosts: ['crm.example.test'],
    );

    $wire = wire(Lattice::remoteSourceRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request()));

    expect($wire[0]['props']['dataEndpoint'])->toBe('/customers')
        ->and($wire[0]['props']['remote']['nodeId'])->toBe('customers');
});

test('source schema resolves local json files for the workbench poc', function (): void {
    Lattice::remoteSources([RemoteSchemaSource::class]);

    $path = fixturePath('Remote/remote-schema.json');
    RemoteSchemaSource::$endpoint = RemoteSchemaEndpoint::file($path);

    $wire = wire(Lattice::remoteSourceRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request()));

    expect($wire[0]['type'])->toBe('remote.data-list')
        ->and($wire[0]['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'audience', 'scopes', 'resource', 'ref'])
        ->and($wire[0]['props']['remote']['source'])->toBe('fixtures.remote-crm')
        ->and($wire[0]['props']['remote']['audience'])->toBe('https://crm.example.test')
        ->and($wire[0]['props']['remote']['scopes'])->toBe(['customers.read'])
        ->and($wire[0]['props']['remote']['nodeId'])->toBe('fixture-customers')
        ->and($wire[0]['props']['remote']['nodeType'])->toBe('remote.data-list')
        ->and($wire[0]['props']['remote']['tokenEndpoint'])->toBe('/lattice/remote-sources/fixtures.remote-crm/token')
        ->and($wire[0]['props']['remote']['ref'])->toBeString()->not->toBe('')
        ->and($wire[0]['schema'][0]['type'])->toBe('card')
        ->and($wire[0]['schema'][0]['props']['dataBindings'])->toBe([
            'title' => 'name',
            'description' => 'email',
        ]);
});

test('source schema rejects invalid local json files', function (): void {
    Lattice::remoteSources([RemoteSchemaSource::class]);

    RemoteSchemaSource::$endpoint = RemoteSchemaEndpoint::file(fixturePath('Remote/invalid-remote-schema.json'));

    expect(fn () => Lattice::remoteSourceRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request())
    )->toThrow(InvalidRemoteSchema::class, 'valid JSON');
});

test('remote schema refs use configured token endpoints', function (): void {
    config()->set('lattice.remote-sources.endpoint', 'custom/remotes/{source}/browser-token');

    Http::preventStrayRequests();
    Http::fake([
        'https://crm.example.test/schema.json' => Http::response([
            'schema' => [
                [
                    'type' => 'remote.data-list',
                    'id' => 'customers',
                    'props' => [
                        'dataEndpoint' => 'https://crm.example.test/customers',
                        'audience' => 'https://crm.example.test',
                        'scopes' => ['customers.read'],
                    ],
                ],
            ],
        ]),
    ]);

    Lattice::remoteSources([RemoteSchemaSource::class]);
    RemoteSchemaSource::$endpoint = RemoteSchemaEndpoint::url(
        'https://crm.example.test/schema.json',
        allowedHosts: ['crm.example.test'],
    );

    $wire = wire(Lattice::remoteSourceRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request()));

    expect($wire[0]['props']['remote']['tokenEndpoint'])->toBe('/custom/remotes/fixtures.remote-crm/browser-token');
});

test('source schema rejects invalid manifest payloads', function (array|string $payload, string $message): void {
    Http::preventStrayRequests();
    Http::fake([
        'https://crm.example.test/schema.json' => Http::response($payload),
    ]);

    Lattice::remoteSources([RemoteSchemaSource::class]);
    RemoteSchemaSource::$endpoint = RemoteSchemaEndpoint::url(
        'https://crm.example.test/schema.json',
        allowedHosts: ['crm.example.test'],
    );

    expect(fn () => Lattice::remoteSourceRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request())
    )->toThrow(InvalidRemoteSchema::class, $message);
})->with([
    'non-array payload' => ['not-json', 'JSON object or array'],
    'associative schema' => [['schema' => ['customers' => ['type' => 'text']]], 'schema list'],
    'scalar node' => [['schema' => ['broken']], 'only object nodes'],
]);

test('source schema rejects remote nodes without required browser token metadata', function (array $node, string $message): void {
    Http::preventStrayRequests();
    Http::fake([
        'https://crm.example.test/schema.json' => Http::response([
            'schema' => [$node],
        ]),
    ]);

    Lattice::remoteSources([RemoteSchemaSource::class]);
    RemoteSchemaSource::$endpoint = RemoteSchemaEndpoint::url(
        'https://crm.example.test/schema.json',
        allowedHosts: ['crm.example.test'],
    );

    expect(fn () => Lattice::remoteSourceRegistry()
        ->resolve('fixtures.remote-crm')
        ->schema(request())
    )->toThrow(InvalidRemoteSchema::class, $message);
})->with([
    'missing audience' => [
        [
            'type' => 'remote.data-list',
            'id' => 'customers',
            'props' => [
                'dataEndpoint' => 'https://crm.example.test/customers',
                'scopes' => ['customers.read'],
            ],
        ],
        'must include an audience',
    ],
    'missing id' => [
        [
            'type' => 'remote.data-list',
            'props' => [
                'dataEndpoint' => 'https://crm.example.test/customers',
                'audience' => 'https://crm.example.test',
                'scopes' => ['customers.read'],
            ],
        ],
        'must include an id or key',
    ],
    'non-list scopes' => [
        [
            'type' => 'remote.data-list',
            'id' => 'customers',
            'props' => [
                'dataEndpoint' => 'https://crm.example.test/customers',
                'audience' => 'https://crm.example.test',
                'scopes' => ['read' => true],
            ],
        ],
        'scopes must be a list of strings',
    ],
    'non-string scope' => [
        [
            'type' => 'remote.data-list',
            'id' => 'customers',
            'props' => [
                'dataEndpoint' => 'https://crm.example.test/customers',
                'audience' => 'https://crm.example.test',
                'scopes' => [true],
            ],
        ],
        'scopes must be a list of strings',
    ],
]);

<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tests\Fixtures\Discovery\DemoCrmSource;

test('source definitions can be registered explicitly', function (): void {
    Lattice::remoteSources([DemoCrmSource::class]);

    $definition = Lattice::remoteSourceRegistry()->resolve('fixtures.crm');

    expect($definition)->toBeInstanceOf(DemoCrmSource::class);
});

test('source token endpoint returns a fake browser token after ref verification', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::remoteSources([DemoCrmSource::class]);

    $ref = app(ComponentReferenceSigner::class)->seal('remote.data-list', 'customers', [
        'audience' => 'https://crm.example.test',
        'source' => 'fixtures.crm',
        'scopes' => ['customers.read'],
    ]);

    $response = $this->postJson('/lattice/remote-sources/fixtures.crm/token', [
        'nodeId' => 'customers',
        'nodeType' => 'remote.data-list',
        'audience' => 'https://crm.example.test',
        'scopes' => ['customers.read'],
    ], $this->latticeHeaders($ref));

    $response
        ->assertOk()
        ->assertJson([
            'accessToken' => 'fake-browser-token',
            'tokenType' => 'Bearer',
            'expiresIn' => 120,
            'audience' => 'https://crm.example.test',
            'scopes' => ['customers.read'],
        ]);
});

test('source token endpoint verifies refs for remote chat components', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::remoteSources([DemoCrmSource::class]);

    $ref = app(ComponentReferenceSigner::class)->seal('chat.box', 'crm-chat', [
        'audience' => 'https://crm.example.test',
        'source' => 'fixtures.crm',
        'scopes' => ['chat.read', 'chat.write'],
    ]);

    $response = $this->postJson('/lattice/remote-sources/fixtures.crm/token', [
        'nodeId' => 'crm-chat',
        'nodeType' => 'chat.box',
        'audience' => 'https://crm.example.test',
        'scopes' => ['chat.read', 'chat.write'],
    ], $this->latticeHeaders($ref));

    $response
        ->assertOk()
        ->assertJson([
            'accessToken' => 'fake-browser-token',
            'tokenType' => 'Bearer',
            'expiresIn' => 120,
            'audience' => 'https://crm.example.test',
            'scopes' => ['chat.read', 'chat.write'],
        ]);
});

test('source token endpoint rejects missing refs', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::remoteSources([DemoCrmSource::class]);

    $this->postJson('/lattice/remote-sources/fixtures.crm/token', [
        'nodeId' => 'customers',
        'nodeType' => 'remote.data-list',
        'audience' => 'https://crm.example.test',
        'scopes' => ['customers.read'],
    ])->assertForbidden();
});

test('source token endpoint rejects audience and scope escalation', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::remoteSources([DemoCrmSource::class]);

    $ref = app(ComponentReferenceSigner::class)->seal('remote.data-list', 'customers', [
        'audience' => 'https://crm.example.test',
        'source' => 'fixtures.crm',
        'scopes' => ['customers.read'],
    ]);

    $this->postJson('/lattice/remote-sources/fixtures.crm/token', [
        'nodeId' => 'customers',
        'nodeType' => 'remote.data-list',
        'audience' => 'https://admin.crm.example.test',
        'scopes' => ['customers.read', 'customers.write'],
    ], $this->latticeHeaders($ref))->assertForbidden();
});

test('source token endpoint rejects refs for a different source', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::remoteSources([DemoCrmSource::class]);

    $ref = app(ComponentReferenceSigner::class)->seal('remote.data-list', 'customers', [
        'audience' => 'https://crm.example.test',
        'source' => 'other.crm',
        'scopes' => ['customers.read'],
    ]);

    $this->postJson('/lattice/remote-sources/fixtures.crm/token', [
        'nodeId' => 'customers',
        'nodeType' => 'remote.data-list',
        'audience' => 'https://crm.example.test',
        'scopes' => ['customers.read'],
    ], $this->latticeHeaders($ref))->assertForbidden();
});

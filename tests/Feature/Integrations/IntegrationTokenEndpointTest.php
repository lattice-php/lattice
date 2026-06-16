<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tests\Fixtures\Discovery\DemoCrmIntegration;

test('integration definitions can be registered explicitly', function (): void {
    Lattice::integrations([DemoCrmIntegration::class]);

    $definition = Lattice::integrationRegistry()->resolve('fixtures.crm');

    expect($definition)->toBeInstanceOf(DemoCrmIntegration::class);
});

test('integration token endpoint returns a fake browser token after ref verification', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::integrations([DemoCrmIntegration::class]);

    $ref = app(ComponentReferenceSigner::class)->seal('remote.data-list', 'customers', [
        'audience' => 'https://crm.example.test',
        'integration' => 'fixtures.crm',
        'scopes' => ['customers.read'],
    ]);

    $response = $this->postJson('/lattice/integrations/fixtures.crm/token', [
        'nodeId' => 'customers',
        'nodeType' => 'remote.data-list',
        'audience' => 'https://crm.example.test',
        'scopes' => ['customers.read'],
    ], latticeHeaders($ref));

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

test('integration token endpoint verifies refs for external chat components', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::integrations([DemoCrmIntegration::class]);

    $ref = app(ComponentReferenceSigner::class)->seal('remote.external-chat-box', 'crm-chat', [
        'audience' => 'https://crm.example.test',
        'integration' => 'fixtures.crm',
        'scopes' => ['chat.read', 'chat.write'],
    ]);

    $response = $this->postJson('/lattice/integrations/fixtures.crm/token', [
        'nodeId' => 'crm-chat',
        'nodeType' => 'remote.external-chat-box',
        'audience' => 'https://crm.example.test',
        'scopes' => ['chat.read', 'chat.write'],
    ], latticeHeaders($ref));

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

test('integration token endpoint rejects missing refs', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::integrations([DemoCrmIntegration::class]);

    $this->postJson('/lattice/integrations/fixtures.crm/token', [
        'nodeId' => 'customers',
        'nodeType' => 'remote.data-list',
        'audience' => 'https://crm.example.test',
        'scopes' => ['customers.read'],
    ])->assertForbidden();
});

test('integration token endpoint rejects audience and scope escalation', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::integrations([DemoCrmIntegration::class]);

    $ref = app(ComponentReferenceSigner::class)->seal('remote.data-list', 'customers', [
        'audience' => 'https://crm.example.test',
        'integration' => 'fixtures.crm',
        'scopes' => ['customers.read'],
    ]);

    $this->postJson('/lattice/integrations/fixtures.crm/token', [
        'nodeId' => 'customers',
        'nodeType' => 'remote.data-list',
        'audience' => 'https://admin.crm.example.test',
        'scopes' => ['customers.read', 'customers.write'],
    ], latticeHeaders($ref))->assertForbidden();
});

test('integration token endpoint rejects refs for a different integration', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::integrations([DemoCrmIntegration::class]);

    $ref = app(ComponentReferenceSigner::class)->seal('remote.data-list', 'customers', [
        'audience' => 'https://crm.example.test',
        'integration' => 'other.crm',
        'scopes' => ['customers.read'],
    ]);

    $this->postJson('/lattice/integrations/fixtures.crm/token', [
        'nodeId' => 'customers',
        'nodeType' => 'remote.data-list',
        'audience' => 'https://crm.example.test',
        'scopes' => ['customers.read'],
    ], latticeHeaders($ref))->assertForbidden();
});

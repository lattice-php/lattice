<?php
declare(strict_types=1);

use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Tests\Fixtures\Discovery\DemoCrmIntegration;

test('integration definitions can be registered explicitly', function (): void {
    Lattice::integrations([DemoCrmIntegration::class]);

    $definition = Lattice::integrationRegistry()->resolve('fixtures.crm');

    expect($definition)->toBeInstanceOf(DemoCrmIntegration::class);
});

test('integration token endpoint returns a fake browser token after ref verification', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::integrations([DemoCrmIntegration::class]);

    $ref = app(ComponentReferenceSigner::class)->seal('integration.browser-data', 'customers', [
        'integration' => 'fixtures.crm',
        'resource' => 'customers',
    ]);

    $response = $this->postJson('/lattice/integrations/fixtures.crm/token', [
        'component' => 'customers',
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

test('integration token endpoint rejects missing refs', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::integrations([DemoCrmIntegration::class]);

    $this->postJson('/lattice/integrations/fixtures.crm/token', [
        'component' => 'customers',
        'audience' => 'https://crm.example.test',
        'scopes' => ['customers.read'],
    ])->assertForbidden();
});

test('integration token endpoint rejects refs for a different integration', function (): void {
    $this->actingAs(workbenchTestUser());
    Lattice::integrations([DemoCrmIntegration::class]);

    $ref = app(ComponentReferenceSigner::class)->seal('integration.browser-data', 'customers', [
        'integration' => 'other.crm',
        'resource' => 'customers',
    ]);

    $this->postJson('/lattice/integrations/fixtures.crm/token', [
        'component' => 'customers',
        'audience' => 'https://crm.example.test',
        'scopes' => ['customers.read'],
    ], latticeHeaders($ref))->assertForbidden();
});

<?php
declare(strict_types=1);

use Lattice\Lattice\Integrations\Components\BrowserData;

test('browser data component serializes token and data endpoints with a signed ref', function (): void {
    $node = wire(
        BrowserData::make('customers')
            ->integration('fixtures.crm')
            ->tokenEndpoint('/lattice/integrations/fixtures.crm/token')
            ->dataEndpoint('/workbench/external/customers')
            ->audience('https://crm.example.test')
            ->scopes(['customers.read'])
            ->resource('customers'),
    );

    expect($node['props']['ref'])->toBeString()->not->toBe('');
    unset($node['props']['ref']);

    expect($node)
        ->toMatchArray([
            'type' => 'integration.browser-data',
            'id' => 'customers',
            'props' => [
                'endpoint' => '/lattice/integrations/fixtures.crm/token',
                'tokenEndpoint' => '/lattice/integrations/fixtures.crm/token',
                'dataEndpoint' => '/workbench/external/customers',
                'audience' => 'https://crm.example.test',
                'scopes' => ['customers.read'],
                'resource' => 'customers',
            ],
        ]);
});

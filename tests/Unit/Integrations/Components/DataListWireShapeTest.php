<?php
declare(strict_types=1);

use Lattice\Lattice\Integrations\Components\DataList;

test('data list component serializes remote access with a signed ref', function (): void {
    $node = wire(
        DataList::make('customers')
            ->integration('fixtures.crm')
            ->dataEndpoint('/workbench/external/customers')
            ->audience('https://crm.example.test')
            ->scopes(['customers.read']),
    );

    expect($node['props']['remote']['ref'])->toBeString()->not->toBe('');
    unset($node['props']['remote']['ref']);

    expect($node)
        ->toMatchArray([
            'type' => 'remote.data-list',
            'id' => 'customers',
            'props' => [
                'dataEndpoint' => '/workbench/external/customers',
                'emptyLabel' => null,
                'remote' => [
                    'integration' => 'fixtures.crm',
                    'audience' => 'https://crm.example.test',
                    'scopes' => ['customers.read'],
                    'nodeId' => 'customers',
                    'nodeType' => 'remote.data-list',
                ],
                'subtitleKey' => null,
                'titleKey' => null,
            ],
        ]);

    expect($node['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'resource', 'ref']);
});

<?php
declare(strict_types=1);

use Lattice\Lattice\Remote\Components\DataList;

test('data list component serializes remote access with a signed ref', function (): void {
    $node = wire(
        DataList::make('customers')
            ->source('fixtures.crm')
            ->dataEndpoint('/workbench/remote/customers')
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
                'dataEndpoint' => '/workbench/remote/customers',
                'emptyLabel' => null,
                'remote' => [
                    'source' => 'fixtures.crm',
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

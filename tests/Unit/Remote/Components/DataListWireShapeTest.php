<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Text;
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
            ],
        ]);

    expect($node['props'])->not->toHaveKeys(['endpoint', 'tokenEndpoint', 'resource', 'ref']);
});

test('data list component serializes a row schema with component data bindings', function (): void {
    $node = wire(
        DataList::make('customers')
            ->source('fixtures.crm')
            ->dataEndpoint('/workbench/remote/customers')
            ->audience('https://crm.example.test')
            ->scopes(['customers.read'])
            ->schema([
                Card::make()
                    ->dataKey('title', 'name')
                    ->schema([
                        Text::make('')
                            ->dataKey('text', 'email'),
                    ]),
            ]),
    );

    expect($node['schema'][0]['type'])->toBe('card')
        ->and($node['schema'][0]['props']['dataBindings'])->toBe(['title' => 'name'])
        ->and($node['schema'][0]['schema'][0]['type'])->toBe('text')
        ->and($node['schema'][0]['schema'][0]['props']['dataBindings'])->toBe(['text' => 'email']);
});

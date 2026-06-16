<?php
declare(strict_types=1);

use Lattice\Lattice\Remote\RemoteSchemaNormalizer;

test('remote schema manifest normalizes to serializable component nodes', function (): void {
    $nodes = app(RemoteSchemaNormalizer::class)->normalize([
        [
            'type' => 'remote.data-list',
            'key' => 'customers',
            'props' => [
                'dataEndpoint' => '/workbench/remote/customers',
                'remote' => [
                    'source' => 'fixtures.crm',
                    'audience' => 'https://crm.example.test',
                    'scopes' => ['customers.read'],
                    'nodeId' => 'customers',
                    'nodeType' => 'remote.data-list',
                    'ref' => 'sealed-ref',
                ],
            ],
            'schema' => [
                [
                    'type' => 'text',
                    'props' => ['text' => 'Customers'],
                ],
            ],
        ],
    ], [
        'source' => 'fixtures.crm',
    ]);

    $wire = wire($nodes);

    expect($wire)->toMatchArray([
        [
            'type' => 'remote.data-list',
            'id' => 'customers',
            'key' => 'customers',
            'props' => [
                'dataEndpoint' => '/workbench/remote/customers',
                'remote' => [
                    'source' => 'fixtures.crm',
                    'audience' => 'https://crm.example.test',
                    'scopes' => ['customers.read'],
                    'nodeId' => 'customers',
                    'nodeType' => 'remote.data-list',
                    'ref' => 'sealed-ref',
                ],
            ],
            'schema' => [
                [
                    'type' => 'text',
                    'props' => ['text' => 'Customers'],
                ],
            ],
        ],
    ]);
});

test('remote schema manifest rejects nodes without a type', function (): void {
    app(RemoteSchemaNormalizer::class)->normalize([
        ['props' => ['label' => 'Broken']],
    ], ['source' => 'fixtures.crm']);
})->throws(InvalidArgumentException::class, 'Remote schema node at [0] is missing a string type.');

<?php
declare(strict_types=1);

use Lattice\Lattice\Integrations\ExternalSchemaNormalizer;

test('external schema manifest normalizes to serializable component nodes', function (): void {
    $nodes = app(ExternalSchemaNormalizer::class)->normalize([
        [
            'type' => 'remote.data-list',
            'key' => 'customers',
            'props' => [
                'dataEndpoint' => '/workbench/external/customers',
                'remote' => [
                    'integration' => 'fixtures.crm',
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
        'integration' => 'fixtures.crm',
    ]);

    $wire = wire($nodes);

    expect($wire)->toMatchArray([
        [
            'type' => 'remote.data-list',
            'id' => 'customers',
            'key' => 'customers',
            'props' => [
                'dataEndpoint' => '/workbench/external/customers',
                'remote' => [
                    'integration' => 'fixtures.crm',
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

test('external schema manifest rejects nodes without a type', function (): void {
    app(ExternalSchemaNormalizer::class)->normalize([
        ['props' => ['label' => 'Broken']],
    ], ['integration' => 'fixtures.crm']);
})->throws(InvalidArgumentException::class, 'External schema node at [0] is missing a string type.');

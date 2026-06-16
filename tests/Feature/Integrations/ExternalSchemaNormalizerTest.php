<?php
declare(strict_types=1);

use Lattice\Lattice\Integrations\ExternalSchemaNormalizer;

test('external schema manifest normalizes to serializable component nodes', function (): void {
    $nodes = app(ExternalSchemaNormalizer::class)->normalize([
        [
            'type' => 'integration.browser-data',
            'key' => 'customers',
            'props' => [
                'endpoint' => '/lattice/integrations/fixtures.crm/token',
                'tokenEndpoint' => '/lattice/integrations/fixtures.crm/token',
                'dataEndpoint' => '/workbench/external/customers',
                'audience' => 'https://crm.example.test',
                'scopes' => ['customers.read'],
                'resource' => 'customers',
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

    expect($wire[0]['props']['ref'])->toBeString()->not->toBe('');
    unset($wire[0]['props']['ref']);

    expect($wire)->toMatchArray([
        [
            'type' => 'integration.browser-data',
            'id' => 'customers',
            'key' => 'customers',
            'props' => [
                'endpoint' => '/lattice/integrations/fixtures.crm/token',
                'tokenEndpoint' => '/lattice/integrations/fixtures.crm/token',
                'dataEndpoint' => '/workbench/external/customers',
                'audience' => 'https://crm.example.test',
                'scopes' => ['customers.read'],
                'resource' => 'customers',
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

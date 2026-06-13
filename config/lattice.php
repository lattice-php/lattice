<?php
declare(strict_types=1);

return [
    'discover' => [
        base_path('app') => 'App',
    ],

    'security' => [
        'ref_lifetime' => 30,
    ],

    'forms' => [
        'endpoint' => 'lattice/forms/{form}',
        'middleware' => ['web'],
        'registered' => [],
    ],

    'tables' => [
        'endpoint' => 'lattice/tables/{table}',
        'middleware' => ['web'],
        'registered' => [],
    ],

    'fragments' => [
        'endpoint' => 'lattice/fragments/{fragment}',
        'middleware' => ['web'],
        'registered' => [],
    ],

    'layouts' => [
        'registered' => [],
    ],

    'actions' => [
        'endpoint' => 'lattice/actions/{action}',
        'middleware' => ['web'],
        'registered' => [],
    ],

    'bulk-actions' => [
        'endpoint' => 'lattice/bulk-actions/{bulkAction}',
        'middleware' => ['web'],
        'registered' => [],
    ],

    'typescript' => [
        'output' => resource_path('js/lattice/generated.d.ts'),
        'module' => '@lattice-php/lattice',
    ],
];

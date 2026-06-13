<?php
declare(strict_types=1);

return [
    'discover' => [
        base_path('app'),
    ],

    'security' => [
        'ref_lifetime' => 30,
    ],

    'files' => [
        'disk' => env('LATTICE_FILES_DISK', 'public'),
        'temp_prefix' => 'tmp',
        'url_ttl' => 5,
    ],

    'forms' => [
        'endpoint' => 'lattice/forms/{form}',
        'middleware' => ['web'],
    ],

    'tables' => [
        'endpoint' => 'lattice/tables/{table}',
        'middleware' => ['web'],
    ],

    'fragments' => [
        'endpoint' => 'lattice/fragments/{fragment}',
        'middleware' => ['web'],
    ],

    'actions' => [
        'endpoint' => 'lattice/actions/{action}',
        'middleware' => ['web'],
    ],

    'bulk-actions' => [
        'endpoint' => 'lattice/bulk-actions/{bulkAction}',
        'middleware' => ['web'],
    ],

    'typescript' => [
        'output' => resource_path('js/lattice/generated.d.ts'),
        'module' => '@lattice-php/lattice',
    ],
];

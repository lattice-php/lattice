<?php
declare(strict_types=1);

return [
    // Component packages add their own roots via composer `extra.lattice.discover` — no app config needed.
    'discover' => [
        base_path('app'),
    ],

    'discovery' => [
        'cache_path' => null,
    ],

    'security' => [
        'ref_lifetime' => 30,
    ],

    'files' => [
        'disk' => env('LATTICE_FILES_DISK', 'public'),
        'temp_prefix' => 'tmp',
        'url_ttl' => 5,
    ],

    'i18n' => [
        'locales' => ['en'],
        'preload_locales' => [],
    ],

    'realtime' => [
        'enabled' => env('LATTICE_REALTIME_ENABLED', true),
    ],

    'frontend' => [
        'dist_path' => null,
        'path' => 'vendor/lattice',
        'theme' => [],
        'echo' => null,
    ],

    'forms' => [
        'endpoint' => 'lattice/forms/{form}',
        'middleware' => ['web', 'auth'],
    ],

    'tables' => [
        'endpoint' => 'lattice/tables/{table}',
        'middleware' => ['web', 'auth'],
    ],

    'fragments' => [
        'endpoint' => 'lattice/fragments/{fragment}',
        'middleware' => ['web', 'auth'],
    ],

    'remote-sources' => [
        'endpoint' => 'lattice/remote-sources/{source}/token',
        'middleware' => ['web', 'auth'],
    ],

    'actions' => [
        'endpoint' => 'lattice/actions/{action}',
        'middleware' => ['web', 'auth'],
    ],

    'bulk-actions' => [
        'endpoint' => 'lattice/bulk-actions/{bulkAction}',
        'middleware' => ['web', 'auth'],
    ],

    'notifications' => [
        'endpoint' => 'lattice/notifications',
        'middleware' => ['web', 'auth'],
        'per_page' => 15,
        'polling_interval' => null,
        'prune_after_days' => 30,
    ],

    'typescript' => [
        'output' => resource_path('js/lattice/generated.d.ts'),
        'module' => '@lattice-php/lattice',
    ],
];

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

    'context' => [
        // Context keys child components inherit from the definition they are
        // built inside (row actions, modal forms, nested actions). Empty means
        // no inheritance; explicit context always wins over inherited keys.
        'inherited_keys' => [],
    ],

    'refs' => [
        'middleware' => ['web'],
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
        'echo' => null,
        'plugins' => [],
    ],

    // Pages ship unauthenticated by default; authorization is opt-in via
    // attribute middleware, `can`, or Page::authorize(). Attribute middleware
    // is merged after this default, never replacing it.
    'pages' => [
        'middleware' => ['web'],
    ],

    'forms' => [
        'middleware' => ['web', 'auth'],
    ],

    'tables' => [
        'middleware' => ['web', 'auth'],
    ],

    'fragments' => [
        'middleware' => ['web', 'auth'],
    ],

    'remote-sources' => [
        'middleware' => ['web', 'auth'],
    ],

    'actions' => [
        'middleware' => ['web', 'auth'],
    ],

    'bulk-actions' => [
        'middleware' => ['web', 'auth'],
    ],

    'notifications' => [
        'endpoint' => 'lattice/notifications',
        'middleware' => ['web', 'auth'],
        // Named profiles expose the same inbox through different authentication stacks.
        // When empty, the endpoint and middleware above register the original route group.
        'routes' => [],
        'component_route' => 'web',
        'per_page' => 15,
        'polling_interval' => null,
        'prune_after_days' => 30,
    ],

    'typescript' => [
        'output' => resource_path('js/lattice/generated.d.ts'),
        'module' => '@lattice-php/core',
    ],
];

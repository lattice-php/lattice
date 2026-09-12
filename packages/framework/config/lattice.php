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
        // built inside (row actions, modal forms, nested actions), on top of
        // every key with a resolver registered via Lattice::context() (which
        // always inherits regardless of this list). Use this for keys that
        // have no resolver but should still cascade; explicit context always
        // wins over inherited keys.
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

    // Every default below applies only to pages and definitions that declare
    // no middleware of their own. A `middleware:` on #[AsPage] or on a
    // definition attribute replaces its group's default outright — spell the
    // whole stack out there, `web` included.
    //
    // Pages ship unauthenticated by default; authorization is opt-in via
    // attribute middleware, `can`, or Page::authorize().
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
        'per_page' => 15,
        'polling_interval' => null,
        'prune_after_days' => 30,
    ],

    'typescript' => [
        'output' => resource_path('js/lattice/generated.d.ts'),
        'module' => '@lattice-php/core',
    ],
];

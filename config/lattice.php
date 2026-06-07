<?php

declare(strict_types=1);

return [
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

    'actions' => [
        'endpoint' => 'lattice/actions/{action}',
        'middleware' => ['web'],
        'registered' => [],
    ],
];

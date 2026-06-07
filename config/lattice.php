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
];

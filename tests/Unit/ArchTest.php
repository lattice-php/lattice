<?php

declare(strict_types=1);

arch('forms do not depend on tables')
    ->expect('Lattice\Lattice\Forms')
    ->not->toUse('Lattice\Lattice\Tables');

arch('tables do not depend on forms')
    ->expect('Lattice\Lattice\Tables')
    ->not->toUse('Lattice\Lattice\Forms');

arch('actions do not depend on forms or tables')
    ->expect('Lattice\Lattice\Actions')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
    ]);

arch('fragments do not depend on forms, tables or actions')
    ->expect('Lattice\Lattice\Fragments')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Actions',
    ]);

arch('core does not depend on the feature domains')
    ->expect('Lattice\Lattice\Core')
    ->not->toUse([
        'Lattice\Lattice\Actions',
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
    ]);

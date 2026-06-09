<?php

declare(strict_types=1);

arch('forms do not depend on tables')
    ->expect('Bambamboole\Lattice\Forms')
    ->not->toUse('Bambamboole\Lattice\Tables');

arch('tables do not depend on forms')
    ->expect('Bambamboole\Lattice\Tables')
    ->not->toUse('Bambamboole\Lattice\Forms');

arch('actions do not depend on forms or tables')
    ->expect('Bambamboole\Lattice\Actions')
    ->not->toUse([
        'Bambamboole\Lattice\Forms',
        'Bambamboole\Lattice\Tables',
    ]);

arch('fragments do not depend on forms, tables or actions')
    ->expect('Bambamboole\Lattice\Fragments')
    ->not->toUse([
        'Bambamboole\Lattice\Forms',
        'Bambamboole\Lattice\Tables',
        'Bambamboole\Lattice\Actions',
    ]);

arch('core does not depend on the feature domains')
    ->expect('Bambamboole\Lattice\Core')
    ->not->toUse([
        'Bambamboole\Lattice\Actions',
        'Bambamboole\Lattice\Forms',
        'Bambamboole\Lattice\Tables',
        'Bambamboole\Lattice\Fragments',
    ]);

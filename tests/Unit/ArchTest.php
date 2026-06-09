<?php

declare(strict_types=1);

arch('forms do not depend on tables')
    ->expect('Bambamboole\Lattice\Forms')
    ->not->toUse('Bambamboole\Lattice\Tables');

arch('tables do not depend on forms')
    ->expect('Bambamboole\Lattice\Tables')
    ->not->toUse('Bambamboole\Lattice\Forms');

arch('core does not depend on forms or tables')
    ->expect('Bambamboole\Lattice\Core')
    ->not->toUse([
        'Bambamboole\Lattice\Forms',
        'Bambamboole\Lattice\Tables',
    ]);

<?php

declare(strict_types=1);

/*
 * Feature-domain isolation.
 *
 * Each feature domain builds on the shared layers (Core, Http, Attributes,
 * Support) but stays independent of its sibling domains. The only intentional
 * couplings are tables -> actions (row and bulk actions) and actions -> forms
 * (action forms); every other cross-domain edge is forbidden below.
 */

arch('forms depend on no other feature domain')
    ->expect('Lattice\Lattice\Forms')
    ->not->toUse([
        'Lattice\Lattice\Actions',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
    ]);

arch('actions depend on no feature domain other than forms')
    ->expect('Lattice\Lattice\Actions')
    ->not->toUse([
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
    ]);

arch('tables depend on no feature domain other than actions')
    ->expect('Lattice\Lattice\Tables')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
    ]);

arch('fragments depend on no other feature domain')
    ->expect('Lattice\Lattice\Fragments')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Actions',
        'Lattice\Lattice\Layouts',
    ]);

arch('layouts depend on no other feature domain')
    ->expect('Lattice\Lattice\Layouts')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Actions',
        'Lattice\Lattice\Fragments',
    ]);

arch('core does not depend on the feature domains')
    ->expect('Lattice\Lattice\Core')
    ->not->toUse([
        'Lattice\Lattice\Actions',
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
    ]);

/*
 * Structural conventions.
 */

arch('contracts are interfaces')
    ->expect([
        'Lattice\Lattice\Core\Contracts',
        'Lattice\Lattice\Actions\Contracts',
        'Lattice\Lattice\Forms\Contracts',
        'Lattice\Lattice\Tables\Contracts',
        'Lattice\Lattice\Fragments\Contracts',
        'Lattice\Lattice\Layouts\Contracts',
    ])
    ->toBeInterfaces();

arch('the lattice facade extends the laravel facade')
    ->expect('Lattice\Lattice\Facades')
    ->toExtend('Illuminate\Support\Facades\Facade');

arch('no debug statements ship in the package')
    ->expect(['dd', 'ddd', 'dump', 'ray', 'var_dump', 'print_r'])
    ->not->toBeUsed();

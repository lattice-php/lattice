<?php
declare(strict_types=1);

/*
 * Layering.
 *
 * Bottom: the shared base — Core, Attributes, and the Support utilities — which
 * the rest of the package builds on and which never depend back on a feature
 * domain or an orchestration layer.
 *
 * Middle: the five feature domains. Each stays independent of its siblings; the
 * only intentional cross-domain couplings are tables -> actions (row and bulk
 * actions) and actions -> forms (action forms).
 *
 * Top: the orchestration and tooling layers — Http and Pages (which render and
 * route pages by consuming the feature domains), Console, and Facades. Nothing
 * below may depend upward on them.
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

arch('core does not depend upward on the orchestration or tooling layers')
    ->expect('Lattice\Lattice\Core')
    ->not->toUse([
        'Lattice\Lattice\Http',
        'Lattice\Lattice\Pages',
        'Lattice\Lattice\Console',
        'Lattice\Lattice\Facades',
    ]);

arch('feature domains never depend upward on the orchestration or tooling layers')
    ->expect([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Actions',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
    ])
    ->not->toUse([
        'Lattice\Lattice\Http',
        'Lattice\Lattice\Pages',
        'Lattice\Lattice\Console',
    ]);

/*
 * Attributes are a shared base layer of plain markers: they describe domain
 * objects without reaching into the domains. Actions is intentionally omitted
 * while the effects system (AsEffect -> Actions\Enums\EffectType) is reworked.
 */
arch('attributes depend on no feature domain or higher layer')
    ->expect('Lattice\Lattice\Attributes')
    ->not->toUse([
        'Lattice\Lattice\Forms',
        'Lattice\Lattice\Tables',
        'Lattice\Lattice\Fragments',
        'Lattice\Lattice\Layouts',
        'Lattice\Lattice\Http',
        'Lattice\Lattice\Pages',
        'Lattice\Lattice\Console',
        'Lattice\Lattice\Facades',
    ]);

/*
 * Structural conventions.
 */

/*
 * Cross-boundary contracts live in a `Contracts` namespace and are interfaces.
 * Capability interfaces that exist only to be implemented by a single local
 * hierarchy (e.g. Tables\Columns\{Filterable, Sortable, ColumnProps},
 * Support\TypeScript\TypeScriptProfile) deliberately sit beside their
 * implementations and are not part of this convention.
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

arch('the package uses strict types throughout')
    ->expect('Lattice\Lattice')
    ->toUseStrictTypes();

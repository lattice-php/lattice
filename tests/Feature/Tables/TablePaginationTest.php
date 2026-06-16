<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;
use Lattice\Lattice\Attributes\Table as TableAttribute;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\TableQuery;
use Orchestra\Testbench\Factories\UserFactory;

test('eloquent tables can use infinite pagination metadata', function () {
    User::query()->delete();

    foreach (['Ada Lovelace', 'Grace Hopper', 'Maya Chen'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => str($name)->slug()->append('@example.com')->toString(),
        ]);
    }

    Lattice::tables([WorkbenchInfiniteUsersTable::class]);

    $table = wire(Table::use(WorkbenchInfiniteUsersTable::class));
    $ref = componentRef($table);

    expect($table['props']['pagination'])
        ->toMatchArray([
            'mode' => 'infinite',
            'currentPage' => 1,
            'hasMore' => true,
            'nextPage' => 2,
            'perPage' => 2,
            'from' => 1,
            'to' => 2,
        ]);

    latticeGet('/lattice/tables/workbench.infinite-users?per_page=2', $ref)
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'infinite')
        ->assertJsonPath('pagination.currentPage', 1)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2)
        ->assertJsonPath('state.page', 1)
        ->assertJsonPath('state.perPage', 2);

    latticeGet('/lattice/tables/workbench.infinite-users?per_page=2&page=2', $ref)
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('pagination.mode', 'infinite')
        ->assertJsonPath('pagination.currentPage', 2)
        ->assertJsonPath('pagination.hasMore', false)
        ->assertJsonPath('pagination.nextPage', null);
});

test('eloquent tables use table pagination with totals by default', function () {
    User::query()->delete();

    foreach (['Ada Lovelace', 'Grace Hopper', 'Maya Chen'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => str($name)->slug()->append('@example.com')->toString(),
        ]);
    }

    Lattice::tables([WorkbenchDefaultUsersTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchDefaultUsersTable::class)));

    latticeGet('/lattice/tables/workbench.default-users?per_page=2', $ref)
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'table')
        ->assertJsonPath('pagination.total', 3)
        ->assertJsonPath('pagination.lastPage', 2)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2);
});

test('eloquent tables can use simple pagination without totals', function () {
    User::query()->delete();

    foreach (['Ada Lovelace', 'Grace Hopper', 'Maya Chen'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => str($name)->slug()->append('@example.com')->toString(),
        ]);
    }

    Lattice::tables([WorkbenchSimpleUsersTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchSimpleUsersTable::class)));

    latticeGet('/lattice/tables/workbench.simple-users?per_page=2', $ref)
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'simple')
        ->assertJsonPath('pagination.total', null)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2);
});

test('eloquent tables can disable pagination for small datasets', function () {
    User::query()->delete();

    foreach (['Ada Lovelace', 'Grace Hopper', 'Maya Chen'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => str($name)->slug()->append('@example.com')->toString(),
        ]);
    }

    Lattice::tables([WorkbenchSmallUsersTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchSmallUsersTable::class)));

    latticeGet('/lattice/tables/workbench.small-users?per_page=1', $ref)
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('pagination.mode', 'none')
        ->assertJsonPath('pagination.total', 3)
        ->assertJsonPath('pagination.hasMore', false);
});

// ---------------------------------------------------------------------------
// Inline fixture classes required only by this file
// ---------------------------------------------------------------------------

/**
 * @extends EloquentTableDefinition<User>
 *
 * @phpstan-extends EloquentTableDefinition<User>
 */
#[TableAttribute('workbench.infinite-users')]
class WorkbenchInfiniteUsersTable extends EloquentTableDefinition
{
    #[Override]
    public function pagination(): PaginationType
    {
        return PaginationType::Infinite;
    }

    #[Override]
    public function perPage(): int
    {
        return 2;
    }

    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable(),
            TextColumn::make('email')->label('Email'),
        ];
    }

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        return User::query()->select(['id', 'name', 'email'])->orderBy('id');
    }
}

/**
 * @extends EloquentTableDefinition<User>
 *
 * @phpstan-extends EloquentTableDefinition<User>
 */
#[TableAttribute('workbench.default-users')]
class WorkbenchDefaultUsersTable extends EloquentTableDefinition
{
    #[Override]
    public function perPage(): int
    {
        return 2;
    }

    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable(),
        ];
    }

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        return User::query()->select(['id', 'name'])->orderBy('id');
    }
}

/**
 * @extends EloquentTableDefinition<User>
 *
 * @phpstan-extends EloquentTableDefinition<User>
 */
#[TableAttribute('workbench.simple-users')]
class WorkbenchSimpleUsersTable extends EloquentTableDefinition
{
    #[Override]
    public function pagination(): PaginationType
    {
        return PaginationType::Simple;
    }

    #[Override]
    public function perPage(): int
    {
        return 2;
    }

    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable(),
        ];
    }

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        return User::query()->select(['id', 'name'])->orderBy('id');
    }
}

/**
 * @extends EloquentTableDefinition<User>
 *
 * @phpstan-extends EloquentTableDefinition<User>
 */
#[TableAttribute('workbench.small-users')]
class WorkbenchSmallUsersTable extends EloquentTableDefinition
{
    #[Override]
    public function pagination(): PaginationType
    {
        return PaginationType::None;
    }

    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable(),
        ];
    }

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        return User::query()->select(['id', 'name'])->orderBy('id');
    }
}

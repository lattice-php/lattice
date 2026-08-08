<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;
use Lattice\Core\Facades\Lattice;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Table\Enums\PaginationType;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableQuery;
use Orchestra\Testbench\Factories\UserFactory;

beforeEach(function (): void {
    User::query()->delete();

    foreach (['Ada Lovelace', 'Grace Hopper', 'Maya Chen'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => str($name)->slug()->append('@example.com')->toString(),
        ]);
    }
});

test('eloquent tables can use infinite pagination metadata', function (): void {
    Lattice::tables([WorkbenchInfiniteUsersTable::class]);

    $table = wire(Table::use(WorkbenchInfiniteUsersTable::class));
    $ref = $this->latticeRef($table);

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

    $this->latticeGet('/lattice/tables/workbench.infinite-users?per_page=2', $ref)
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'infinite')
        ->assertJsonPath('pagination.currentPage', 1)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2)
        ->assertJsonPath('query.page', 1)
        ->assertJsonPath('query.perPage', 2);

    $this->latticeGet('/lattice/tables/workbench.infinite-users?per_page=2&page=2', $ref)
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('pagination.mode', 'infinite')
        ->assertJsonPath('pagination.currentPage', 2)
        ->assertJsonPath('pagination.hasMore', false)
        ->assertJsonPath('pagination.nextPage', null);
});

test('eloquent tables use table pagination with totals by default', function (): void {
    Lattice::tables([WorkbenchDefaultUsersTable::class]);

    $this->loadTable(WorkbenchDefaultUsersTable::class, ['per_page' => 2])
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'table')
        ->assertJsonPath('pagination.total', 3)
        ->assertJsonPath('pagination.lastPage', 2)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2);
});

test('eloquent tables can use simple pagination without totals', function (): void {
    Lattice::tables([WorkbenchSimpleUsersTable::class]);

    $this->loadTable(WorkbenchSimpleUsersTable::class, ['per_page' => 2])
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'simple')
        ->assertJsonPath('pagination.total', null)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2);
});

test('eloquent tables can disable pagination for small datasets', function (): void {
    Lattice::tables([WorkbenchSmallUsersTable::class]);

    $this->loadTable(WorkbenchSmallUsersTable::class, ['per_page' => 1])
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('pagination.mode', 'none')
        ->assertJsonPath('pagination.total', 3)
        ->assertJsonPath('pagination.hasMore', false);
});

test('declared per-page options validate the requested page size', function (): void {
    Lattice::tables([WorkbenchPerPageUsersTable::class]);

    expect(wire(Table::use(WorkbenchPerPageUsersTable::class))['props']['perPageOptions'])
        ->toBe([1, 2, 200, 'infinite']);

    $this->loadTable(WorkbenchPerPageUsersTable::class, ['per_page' => 1])
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('query.perPage', 1);

    $this->loadTable(WorkbenchPerPageUsersTable::class, ['per_page' => 7])
        ->assertOk()
        ->assertJsonPath('query.perPage', 2);

    $this->loadTable(WorkbenchPerPageUsersTable::class, ['per_page' => 200])
        ->assertOk()
        ->assertJsonPath('query.perPage', 200);
});

test('mode=infinite switches a table-mode table to infinite pagination', function (): void {
    Lattice::tables([WorkbenchPerPageUsersTable::class]);

    $this->loadTable(WorkbenchPerPageUsersTable::class, ['per_page' => 2, 'mode' => 'infinite'])
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'infinite')
        ->assertJsonPath('pagination.total', null)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('query.mode', 'infinite');
});

test('mode=table switches an infinite-mode table to numbered pagination', function (): void {
    Lattice::tables([WorkbenchInfiniteSwitchUsersTable::class]);

    $this->loadTable(WorkbenchInfiniteSwitchUsersTable::class, ['per_page' => 2, 'mode' => 'table'])
        ->assertOk()
        ->assertJsonPath('pagination.mode', 'table')
        ->assertJsonPath('pagination.total', 3)
        ->assertJsonPath('pagination.lastPage', 2)
        ->assertJsonPath('query.mode', 'table');
});

test('mode=infinite is ignored when infinite is not declared', function (): void {
    Lattice::tables([WorkbenchNumericPerPageUsersTable::class]);

    $this->loadTable(WorkbenchNumericPerPageUsersTable::class, ['mode' => 'infinite'])
        ->assertOk()
        ->assertJsonPath('pagination.mode', 'table')
        ->assertJsonPath('query.mode', null);
});

test('mode overrides are ignored when no options are declared', function (): void {
    Lattice::tables([WorkbenchDefaultUsersTable::class]);

    $this->loadTable(WorkbenchDefaultUsersTable::class, ['mode' => 'infinite'])
        ->assertOk()
        ->assertJsonPath('pagination.mode', 'table')
        ->assertJsonPath('query.mode', null);
});

/**
 * @extends EloquentTableDefinition<User>
 */
#[AsTable('workbench.infinite-users')]
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
 */
#[AsTable('workbench.default-users')]
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
 */
#[AsTable('workbench.simple-users')]
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
 */
#[AsTable('workbench.small-users')]
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

/**
 * @extends EloquentTableDefinition<User>
 */
#[AsTable('workbench.per-page-users')]
class WorkbenchPerPageUsersTable extends EloquentTableDefinition
{
    #[Override]
    public function perPage(): int
    {
        return 2;
    }

    /**
     * @return array<int, int|PaginationType::Infinite>
     */
    #[Override]
    public function perPageOptions(): array
    {
        return [1, 2, 200, PaginationType::Infinite];
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
 */
#[AsTable('workbench.infinite-switch-users')]
class WorkbenchInfiniteSwitchUsersTable extends EloquentTableDefinition
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

    /**
     * @return array<int, int|PaginationType::Infinite>
     */
    #[Override]
    public function perPageOptions(): array
    {
        return [2, PaginationType::Infinite];
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
 */
#[AsTable('workbench.numeric-per-page-users')]
class WorkbenchNumericPerPageUsersTable extends EloquentTableDefinition
{
    /**
     * @return array<int, int|PaginationType::Infinite>
     */
    #[Override]
    public function perPageOptions(): array
    {
        return [1, 2];
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

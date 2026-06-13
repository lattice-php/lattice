<?php
declare(strict_types=1);

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\Table as TableAttribute;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tables\CallbackTableSource;
use Lattice\Lattice\Tables\Columns\StackColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;
use Lattice\Lattice\Tests\Fixtures\Workbench\WorkbenchPingAction;
use Workbench\App\Tables\UsersTable as WorkbenchAppUsersTable;

use function Pest\Laravel\getJson;

test('registered tables serialize their configured endpoint columns state and initial data', function () {
    config(['lattice.tables.endpoint' => 'custom/tables/{table}']);

    Lattice::tables([WorkbenchUsersTable::class]);

    $table = wire(Table::use(WorkbenchUsersTable::class));

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.users',
            'props' => [
                'endpoint' => '/custom/tables/workbench.users',
                'ref' => componentRef($table),
                'layout' => null,
                'bulkActions' => [],
                'striped' => null,
                'lazy' => null,
                'resizableColumns' => null,
                'resizeIndicator' => false,
                'actionsLabel' => 'Actions',
                'emptyLabel' => 'No results',
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'text',
                        'sortable' => true,
                        'filter' => [
                            'enabled' => true,
                            'type' => 'text',
                            'operators' => ['contains', 'starts_with', 'ends_with', 'eq', 'neq', 'empty', 'filled'],
                            'defaultOperator' => 'contains',
                        ],
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                    ],
                    [
                        'key' => 'status',
                        'label' => 'Status',
                        'type' => 'text',
                        'sortable' => null,
                        'filter' => [
                            'enabled' => true,
                            'type' => 'text',
                            'operators' => ['contains', 'starts_with', 'ends_with', 'eq', 'neq', 'empty', 'filled'],
                            'defaultOperator' => 'eq',
                        ],
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                    ],
                    [
                        'key' => 'email',
                        'label' => 'Email',
                        'type' => 'text',
                        'sortable' => true,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                    ],
                ],
                'data' => [
                    [
                        'name' => 'Taylor',
                        'filters' => [],
                        'sorts' => [],
                    ],
                ],
                'state' => [
                    'filters' => [],
                    'sorts' => [],
                    'page' => 1,
                    'perPage' => 25,
                ],
                'pagination' => [],
            ],
        ]);
});

test('registered tables can serialize lazily without running their query', function () {
    config(['lattice.tables.endpoint' => 'custom/tables/{table}']);

    Lattice::tables([WorkbenchLazyUsersTable::class]);

    $table = wire(Table::lazy(WorkbenchLazyUsersTable::class));

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.lazy-users',
            'props' => [
                'endpoint' => '/custom/tables/workbench.lazy-users',
                'lazy' => true,
                'ref' => componentRef($table),
                'layout' => null,
                'bulkActions' => [],
                'striped' => null,
                'resizableColumns' => null,
                'resizeIndicator' => false,
                'actionsLabel' => 'Actions',
                'emptyLabel' => 'No results',
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'text',
                        'sortable' => null,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                    ],
                ],
                'data' => [],
                'state' => [
                    'filters' => [],
                    'sorts' => [],
                    'page' => 1,
                    'perPage' => 25,
                ],
                'pagination' => [
                    'mode' => 'table',
                ],
            ],
        ]);
});

test('registered tables serialize grid layout stack columns and row actions', function () {
    Lattice::actions([WorkbenchPingAction::class]);
    Lattice::tables([WorkbenchStackedUsersTable::class]);

    $table = wire(Table::use(WorkbenchStackedUsersTable::class));

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.stacked-users',
        ])
        ->and($table['props']['layout'])->toBe('grid')
        ->and($table['props']['columns'])->toMatchArray([
            [
                'key' => 'identity',
                'label' => 'Identity',
                'type' => 'stack',
                'sortable' => null,
                'filter' => null,
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'text',
                        'sortable' => true,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                    ],
                    [
                        'key' => 'email',
                        'label' => 'Email',
                        'type' => 'text',
                        'sortable' => null,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                    ],
                ],
                'props' => null,
                'width' => 'xl',
            ],
            [
                'key' => 'status',
                'label' => 'Status',
                'type' => 'text',
                'sortable' => null,
                'filter' => null,
                'columns' => null,
                'props' => ['date' => null, 'copyable' => false, 'link' => null],
                'width' => 'md',
            ],
        ])
        ->and($table['props']['data'][0]['actions'][0])->toMatchArray([
            'type' => 'action',
            'id' => 'workbench.ping',
        ])
        ->and($table['props']['data'][0]['actions'][0]['props'])
        ->toMatchArray([
            'label' => 'Ping',
            'method' => 'post',
        ]);
});

test('registered tables parse clause filters sorts and pagination through the endpoint', function () {
    Lattice::tables([WorkbenchUsersTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchUsersTable::class)));

    latticeGet('/lattice/tables/workbench.users?filter=name:contains:tay,status:eq:active&sort=-name,email&page=2&per_page=50', $ref)
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Taylor')
        ->assertJsonPath('data.0.filters.0', ['field' => 'name', 'operator' => 'contains', 'value' => 'tay'])
        ->assertJsonPath('data.0.filters.1', ['field' => 'status', 'operator' => 'eq', 'value' => 'active'])
        ->assertJsonPath('data.0.sorts.0.key', 'name')
        ->assertJsonPath('data.0.sorts.0.direction', 'desc')
        ->assertJsonPath('data.0.sorts.1.key', 'email')
        ->assertJsonPath('data.0.sorts.1.direction', 'asc')
        ->assertJsonPath('state.filters.0.field', 'name')
        ->assertJsonPath('state.filters.1.field', 'status')
        ->assertJsonPath('state.page', 2)
        ->assertJsonPath('state.perPage', 50);
});

test('registered tables reject filters and sorts that are not allowed by columns', function () {
    Lattice::tables([WorkbenchUsersTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchUsersTable::class)));

    latticeGet('/lattice/tables/workbench.users?filter=password:contains:secret', $ref)
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Filter [password] is not allowed for table [workbench.users].')
        ->assertJsonPath('errors.filter.0', 'Filter [password] is not allowed for table [workbench.users].');

    latticeGet('/lattice/tables/workbench.users?sort=password', $ref)
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Sort [password] is not allowed for table [workbench.users].')
        ->assertJsonPath('errors.sort.0', 'Sort [password] is not allowed for table [workbench.users].');
});

test('registered table endpoints require a valid component reference and use trusted context', function () {
    discoverFixtures();

    $ref = componentRef(wire(Table::use(DiscoveredUsersTable::class)
        ->context(['team' => 'trusted-team'])));

    getJson('/lattice/tables/fixtures.users')
        ->assertForbidden();

    getJson('/lattice/tables/fixtures.users', latticeHeaders('tampered'))
        ->assertForbidden();

    latticeGet('/lattice/tables/fixtures.users?context[team]=tampered-team', $ref)
        ->assertOk()
        ->assertJsonPath('data.0.name', 'trusted-team');
});

test('text columns serialize display modifiers', function () {
    expect(wire(TextColumn::make('published_at')
        ->label('Published')
        ->date('Y-m-d')
        ->copyable()
        ->link('/posts/{id}')))
        ->toMatchArray([
            'key' => 'published_at',
            'label' => 'Published',
            'type' => 'text',
            'props' => [
                'date' => ['format' => 'Y-m-d'],
                'copyable' => true,
                'link' => ['href' => '/posts/{id}', 'external' => false],
            ],
        ]);
});

test('workbench users table exposes timestamp columns for each row', function () {
    Lattice::tables([WorkbenchAppUsersTable::class]);

    $columns = wire(Table::use(WorkbenchAppUsersTable::class))['props']['columns'];

    expect(array_column($columns, 'key'))->toBe(['name', 'email', 'created_at', 'updated_at'])
        ->and($columns[2])->toMatchArray([
            'key' => 'created_at',
            'label' => 'Created at',
            'sortable' => true,
            'props' => ['date' => ['format' => 'Y-m-d H:i:s'], 'copyable' => false, 'link' => null],
        ])
        ->and($columns[3])->toMatchArray([
            'key' => 'updated_at',
            'label' => 'Updated at',
            'sortable' => true,
            'props' => ['date' => ['format' => 'Y-m-d H:i:s'], 'copyable' => false, 'link' => null],
        ]);
});

// ---------------------------------------------------------------------------
// Inline fixture classes required only by this file
// ---------------------------------------------------------------------------

#[TableAttribute('workbench.users')]
class WorkbenchUsersTable extends TableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')
                ->label('Name')
                ->sortable()
                ->filterable(),
            TextColumn::make('status')
                ->label('Status')
                ->filterable(Op::Equals),
            TextColumn::make('email')
                ->label('Email')
                ->sortable(),
        ];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            [
                'name' => 'Taylor',
                'filters' => array_map(
                    fn ($filter): array => wire($filter),
                    $query->filters(),
                ),
                'sorts' => array_map(
                    fn ($sort): array => [
                        'key' => $sort->key,
                        'direction' => $sort->direction,
                    ],
                    $query->sorts(),
                ),
            ],
        ]));
    }
}

#[TableAttribute('workbench.lazy-users')]
class WorkbenchLazyUsersTable extends TableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name'),
        ];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(function (TableQuery $query): TableResult {
            throw new RuntimeException('Lazy table query should not run during serialization.');
        });
    }
}

#[TableAttribute('workbench.stacked-users')]
class WorkbenchStackedUsersTable extends TableDefinition
{
    public function layout(): string
    {
        return 'grid';
    }

    public function pagination(): PaginationType
    {
        return PaginationType::None;
    }

    public function columns(): array
    {
        return [
            StackColumn::make('identity')
                ->label('Identity')
                ->columns([
                    TextColumn::make('name')->label('Name')->sortable(),
                    TextColumn::make('email')->label('Email'),
                ]),
            TextColumn::make('status')->label('Status'),
        ];
    }

    public function actions(array $row): array
    {
        return [
            Action::use(WorkbenchPingAction::class),
        ];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            [
                'id' => 1,
                'name' => 'Taylor',
                'email' => 'taylor@example.com',
                'status' => 'Active',
            ],
        ]));
    }
}

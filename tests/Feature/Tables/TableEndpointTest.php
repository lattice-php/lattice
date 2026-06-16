<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tables\CallbackTableSource;
use Lattice\Lattice\Tables\Columns\StackColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;
use Lattice\Lattice\Tests\Fixtures\Workbench\WorkbenchPingAction;
use Workbench\App\Models\Product;
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
                'filters' => [],
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'column.text',
                        'sortable' => true,
                        'filter' => [
                            'enabled' => true,
                            'type' => 'text',
                            'operators' => ['contains', 'starts_with', 'ends_with', 'eq', 'neq', 'empty', 'filled'],
                            'defaultOperator' => 'contains',
                            'control' => null,
                            'options' => [],
                            'multiple' => false,
                            'searchable' => false,
                        ],
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                        'align' => 'start',
                    ],
                    [
                        'key' => 'status',
                        'label' => 'Status',
                        'type' => 'column.text',
                        'sortable' => null,
                        'filter' => [
                            'enabled' => true,
                            'type' => 'text',
                            'operators' => ['contains', 'starts_with', 'ends_with', 'eq', 'neq', 'empty', 'filled'],
                            'defaultOperator' => 'eq',
                            'control' => null,
                            'options' => [],
                            'multiple' => false,
                            'searchable' => false,
                        ],
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                        'align' => 'start',
                    ],
                    [
                        'key' => 'email',
                        'label' => 'Email',
                        'type' => 'column.text',
                        'sortable' => true,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                        'align' => 'start',
                    ],
                ],
                'data' => [
                    [
                        'name' => 'Taylor',
                    ],
                ],
                'state' => [
                    'filters' => [],
                    'sorts' => [],
                    'page' => 1,
                    'perPage' => 25,
                    'tableFilters' => [],
                ],
                'pagination' => null,
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
                'filters' => [],
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'column.text',
                        'sortable' => null,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                        'align' => 'start',
                    ],
                ],
                'data' => [],
                'state' => [
                    'filters' => [],
                    'sorts' => [],
                    'page' => 1,
                    'perPage' => 25,
                    'tableFilters' => [],
                ],
                'pagination' => [
                    'mode' => 'table',
                    'currentPage' => null,
                    'lastPage' => null,
                    'perPage' => null,
                    'total' => null,
                    'from' => null,
                    'to' => null,
                    'hasMore' => false,
                    'nextPage' => null,
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
                'type' => 'column.stack',
                'sortable' => null,
                'filter' => null,
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'column.text',
                        'sortable' => true,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                        'align' => 'start',
                    ],
                    [
                        'key' => 'email',
                        'label' => 'Email',
                        'type' => 'column.text',
                        'sortable' => null,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                        'width' => 'md',
                        'align' => 'start',
                    ],
                ],
                'props' => null,
                'width' => 'xl',
                'align' => 'start',
            ],
            [
                'key' => 'status',
                'label' => 'Status',
                'type' => 'column.text',
                'sortable' => null,
                'filter' => null,
                'columns' => null,
                'props' => ['date' => null, 'copyable' => false, 'link' => null],
                'width' => 'md',
                'align' => 'start',
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
        ->assertJsonPath('state.filters.0.field', 'name')
        ->assertJsonPath('state.filters.1.field', 'status')
        ->assertJsonPath('state.page', 2)
        ->assertJsonPath('state.perPage', 50);

    expect(session('workbench-users-table-query'))->toMatchArray([
        'filters' => [
            ['field' => 'name', 'operator' => 'contains', 'value' => 'tay'],
            ['field' => 'status', 'operator' => 'eq', 'value' => 'active'],
        ],
        'sorts' => [
            ['key' => 'name', 'direction' => 'desc'],
            ['key' => 'email', 'direction' => 'asc'],
        ],
        'page' => 2,
        'perPage' => 50,
    ]);
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

test('registered table responses expose only declared columns row identity and generated actions', function () {
    Lattice::tables([WorkbenchProjectedProductsTable::class]);

    $product = Product::factory()->create([
        'name' => 'Projected Product',
        'sku' => 'PROJECT-001',
        'status' => 'active',
        'featured' => true,
    ]);
    $related = Product::factory()->create([
        'sku' => 'PROJECT-RELATED',
    ]);

    $product->relatedProducts()->attach($related);

    $ref = componentRef(wire(Table::use(WorkbenchProjectedProductsTable::class)));
    $row = latticeGet('/lattice/tables/workbench.projected-products', $ref)
        ->assertOk()
        ->json('data.0');

    expect($row)->toBeArray();
    assert(is_array($row));

    expect(array_keys($row))->toBe(['id', 'name', 'sku', 'status', 'actions'])
        ->and($row['id'])->toBe($product->getKey())
        ->and($row['name'])->toBe('Projected Product')
        ->and($row['sku'])->toBe('PROJECT-001')
        ->and($row['status'])->toBe('active')
        ->and($row['actions'][0]['type'])->toBe('link')
        ->and($row['actions'][0]['key'])->toBe('edit-product')
        ->and($row['actions'][0]['props']['href'])->toBe("/products/{$product->getKey()}/edit");
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
            'type' => 'column.text',
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

#[AsTable('workbench.users')]
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
        return new CallbackTableSource(function (TableQuery $query): TableResult {
            session()->put('workbench-users-table-query', wire($query));

            return TableResult::make([
                [
                    'name' => 'Taylor',
                ],
            ]);
        });
    }
}

#[AsTable('workbench.lazy-users')]
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

#[AsTable('workbench.stacked-users')]
class WorkbenchStackedUsersTable extends TableDefinition
{
    #[Override]
    public function layout(): string
    {
        return 'grid';
    }

    #[Override]
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

    #[Override]
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

/**
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('workbench.projected-products')]
class WorkbenchProjectedProductsTable extends EloquentTableDefinition
{
    public function columns(): array
    {
        return [
            StackColumn::make('identity')
                ->label('Identity')
                ->columns([
                    TextColumn::make('name')->label('Name'),
                    TextColumn::make('sku')->label('SKU'),
                ]),
            TextColumn::make('status')->label('Status'),
        ];
    }

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        return Product::query()
            ->with('relatedProducts')
            ->where('sku', 'PROJECT-001');
    }

    #[Override]
    public function actions(array $row): array
    {
        return [
            Link::make('Edit', 'edit-product')
                ->href("/products/{$row['id']}/edit"),
        ];
    }
}

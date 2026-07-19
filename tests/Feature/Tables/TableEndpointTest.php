<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tables\CallbackTableSource;
use Lattice\Lattice\Tables\Columns\StackColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;
use Lattice\Lattice\Tests\Fixtures\Workbench\WorkbenchPingAction;
use Lattice\Lattice\Ui\Components\Link;
use Lattice\Lattice\Ui\Components\Text;
use Workbench\App\Models\Product;
use Workbench\App\Tables\UsersTable as WorkbenchAppUsersTable;

use function Pest\Laravel\getJson;

test('registered tables serialize their configured endpoint columns state and initial data', function (): void {
    config(['lattice.tables.endpoint' => 'custom/tables/{table}']);

    Lattice::tables([WorkbenchUsersTable::class]);

    $table = wire(Table::use(WorkbenchUsersTable::class));

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.users',
            'props' => [
                'endpoint' => '/custom/tables/workbench.users',
                'ref' => $this->latticeRef($table),
                'layout' => null,
                'bulkActions' => [],
                'striped' => false,
                'searchable' => false,
                'lazy' => false,
                'resizableColumns' => false,
                'resizeIndicator' => false,
                'actionsLabel' => null,
                'emptyLabel' => null,
                'filters' => [],
                'columns' => [
                    [
                        'key' => 'name',
                        'type' => 'column.text',
                        'props' => [
                            'label' => 'Name',
                            'sortable' => true,
                            'toggleable' => false,
                            'hiddenByDefault' => false,
                            'filter' => [
                                'type' => 'text',
                                'operators' => ['contains', 'starts_with', 'ends_with', 'eq', 'neq', 'empty', 'filled'],
                                'defaultOperator' => 'contains',
                                'control' => null,
                                'options' => [],
                                'clauseOptions' => [],
                                'multiple' => false,
                                'searchable' => false,
                            ],
                            'date' => null,
                            'copyable' => false,
                            'link' => null,
                            'badge' => null,
                            'multiple' => null,
                            'width' => 'md',
                            'align' => 'start',
                        ],
                    ],
                    [
                        'key' => 'status',
                        'type' => 'column.text',
                        'props' => [
                            'label' => 'Status',
                            'sortable' => false,
                            'toggleable' => false,
                            'hiddenByDefault' => false,
                            'filter' => [
                                'type' => 'text',
                                'operators' => ['contains', 'starts_with', 'ends_with', 'eq', 'neq', 'empty', 'filled'],
                                'defaultOperator' => 'eq',
                                'control' => null,
                                'options' => [],
                                'clauseOptions' => [],
                                'multiple' => false,
                                'searchable' => false,
                            ],
                            'date' => null,
                            'copyable' => false,
                            'link' => null,
                            'badge' => null,
                            'multiple' => null,
                            'width' => 'md',
                            'align' => 'start',
                        ],
                    ],
                    [
                        'key' => 'email',
                        'type' => 'column.text',
                        'props' => [
                            'label' => 'Email',
                            'sortable' => true,
                            'toggleable' => false,
                            'hiddenByDefault' => false,
                            'filter' => null,
                            'date' => null,
                            'copyable' => false,
                            'link' => null,
                            'badge' => null,
                            'multiple' => null,
                            'width' => 'md',
                            'align' => 'start',
                        ],
                    ],
                ],
                'data' => [
                    [
                        'name' => 'Taylor',
                    ],
                ],
                'query' => [
                    'filters' => [],
                    'sorts' => [],
                    'page' => 1,
                    'perPage' => 25,
                    'tableFilters' => [],
                    'tableFilterIndicators' => [],
                    'search' => '',
                ],
                'pagination' => null,
            ],
        ]);
});

test('registered tables can serialize lazily without running their query', function (): void {
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
                'ref' => $this->latticeRef($table),
                'layout' => null,
                'bulkActions' => [],
                'striped' => false,
                'searchable' => false,
                'resizableColumns' => false,
                'resizeIndicator' => false,
                'actionsLabel' => null,
                'emptyLabel' => null,
                'filters' => [],
                'columns' => [
                    [
                        'key' => 'name',
                        'type' => 'column.text',
                        'props' => [
                            'label' => 'Name',
                            'sortable' => false,
                            'toggleable' => false,
                            'hiddenByDefault' => false,
                            'filter' => null,
                            'date' => null,
                            'copyable' => false,
                            'link' => null,
                            'badge' => null,
                            'multiple' => null,
                            'width' => 'md',
                            'align' => 'start',
                        ],
                    ],
                ],
                'data' => [],
                'query' => [
                    'filters' => [],
                    'sorts' => [],
                    'page' => 1,
                    'perPage' => 25,
                    'tableFilters' => [],
                    'tableFilterIndicators' => [],
                    'search' => '',
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

test('registered tables serialize grid layout stack columns and row actions', function (): void {
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
                'type' => 'column.stack',
                'props' => [
                    'label' => 'Identity',
                    'sortable' => false,
                    'toggleable' => false,
                    'hiddenByDefault' => false,
                    'filter' => null,
                    'width' => 'xl',
                    'align' => 'start',
                ],
                'schema' => [
                    [
                        'type' => 'text',
                        'props' => [
                            'text' => '',
                            'align' => null,
                            'size' => 'md',
                            'color' => null,
                            'copyable' => false,
                            'dataBindings' => ['text' => 'name'],
                        ],
                    ],
                    [
                        'type' => 'text',
                        'props' => [
                            'text' => '',
                            'align' => null,
                            'size' => 'md',
                            'color' => null,
                            'copyable' => false,
                            'dataBindings' => ['text' => 'email'],
                        ],
                    ],
                ],
            ],
            [
                'key' => 'status',
                'type' => 'column.text',
                'props' => [
                    'label' => 'Status',
                    'sortable' => false,
                    'toggleable' => false,
                    'hiddenByDefault' => false,
                    'filter' => null,
                    'date' => null,
                    'copyable' => false,
                    'link' => null,
                    'badge' => null,
                    'multiple' => null,
                    'width' => 'md',
                    'align' => 'start',
                ],
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

test('an unauthorized bare row action is filtered out of the row payload', function (): void {
    Lattice::actions([WorkbenchPingAction::class]);
    Lattice::tables([WorkbenchGatedRowActionsUsersTable::class]);

    $table = wire(Table::use(WorkbenchGatedRowActionsUsersTable::class));

    expect($table['props']['data'][0]['actions'])->toHaveCount(1)
        ->and($table['props']['data'][0]['actions'][0]['id'])->toBe('workbench.ping');
});

test('registered tables parse clause filters sorts and pagination through the endpoint', function (): void {
    Lattice::tables([WorkbenchUsersTable::class]);

    $this->loadTable(WorkbenchUsersTable::class, [
        'filter' => 'name:contains:tay,status:eq:active',
        'sort' => '-name,email',
        'page' => 2,
        'per_page' => 50,
    ])
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Taylor')
        ->assertJsonPath('query.filters.0.field', 'name')
        ->assertJsonPath('query.filters.1.field', 'status')
        ->assertJsonPath('query.page', 2)
        ->assertJsonPath('query.perPage', 50);

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

test('registered tables reject filters and sorts that are not allowed by columns', function (): void {
    Lattice::tables([WorkbenchUsersTable::class]);

    $ref = $this->latticeRef(wire(Table::use(WorkbenchUsersTable::class)));

    $this->latticeGet('/lattice/tables/workbench.users?filter=password:contains:secret', $ref)
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Filter [password] is not allowed for table [workbench.users].')
        ->assertJsonPath('errors.filter.0', 'Filter [password] is not allowed for table [workbench.users].');

    $this->latticeGet('/lattice/tables/workbench.users?sort=password', $ref)
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Sort [password] is not allowed for table [workbench.users].')
        ->assertJsonPath('errors.sort.0', 'Sort [password] is not allowed for table [workbench.users].');
});

test('registered table endpoints require a valid component reference and use trusted context', function (): void {
    discoverFixtures();

    $ref = $this->latticeRef(wire(Table::use(DiscoveredUsersTable::class)
        ->context(['team' => 'trusted-team'])));

    getJson('/lattice/tables/fixtures.users')
        ->assertForbidden();

    getJson('/lattice/tables/fixtures.users', $this->latticeHeaders('tampered'))
        ->assertForbidden();

    $this->latticeGet('/lattice/tables/fixtures.users?context[team]=tampered-team', $ref)
        ->assertOk()
        ->assertJsonPath('data.0.name', 'trusted-team');
});

test('registered table responses expose only declared columns row identity and generated actions', function (): void {
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

    $ref = $this->latticeRef(wire(Table::use(WorkbenchProjectedProductsTable::class)));
    $row = $this->latticeGet('/lattice/tables/workbench.projected-products', $ref)
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

test('registered table responses prune hidden columns from the row payload', function (): void {
    Lattice::tables([WorkbenchHiddenColumnUsersTable::class]);

    $ref = $this->latticeRef(wire(Table::use(WorkbenchHiddenColumnUsersTable::class)));
    $row = $this->latticeGet('/lattice/tables/workbench.hidden-column-users', $ref)
        ->assertOk()
        ->json('data.0');

    expect($row)->toBeArray();
    assert(is_array($row));

    expect(array_keys($row))->toBe(['name'])
        ->and($row)->not->toHaveKey('secret');
});

test('a hidden column referenced by a visible badge column is still pruned from the row payload', function (): void {
    Lattice::tables([WorkbenchHiddenBadgeHelperUsersTable::class]);

    $ref = $this->latticeRef(wire(Table::use(WorkbenchHiddenBadgeHelperUsersTable::class)));
    $row = $this->latticeGet('/lattice/tables/workbench.hidden-badge-helper-users', $ref)
        ->assertOk()
        ->json('data.0');

    expect($row)->toBeArray();
    assert(is_array($row));

    expect(array_keys($row))->toBe(['status'])
        ->and($row)->not->toHaveKey('helper');
});

test('workbench users table exposes timestamp columns for each row', function (): void {
    Lattice::tables([WorkbenchAppUsersTable::class]);

    $columns = wire(Table::use(WorkbenchAppUsersTable::class))['props']['columns'];

    expect(array_column($columns, 'key'))->toBe(['name', 'email', 'created_at', 'updated_at'])
        ->and($columns[2])->toMatchArray(['key' => 'created_at'])
        ->and($columns[2]['props'])->toMatchArray([
            'label' => 'Created at',
            'sortable' => true,
            'date' => ['dateStyle' => 'medium', 'timeStyle' => 'medium'],
            'copyable' => false,
            'link' => null,
            'badge' => null,
            'multiple' => null,
        ])
        ->and($columns[3])->toMatchArray(['key' => 'updated_at'])
        ->and($columns[3]['props'])->toMatchArray([
            'label' => 'Updated at',
            'sortable' => true,
            'date' => ['dateStyle' => 'medium', 'timeStyle' => 'medium'],
            'copyable' => false,
            'link' => null,
            'badge' => null,
            'multiple' => null,
        ]);
});

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
                ->schema([
                    Text::make('')->dataKey('text', 'name'),
                    Text::make('')->dataKey('text', 'email'),
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

#[AsTable('workbench.gated-row-actions-users')]
class WorkbenchGatedRowActionsUsersTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    #[Override]
    public function actions(array $row): array
    {
        return [
            Action::use(WorkbenchPingAction::class),
            Action::make('secret')->label('Secret')->visible(false),
        ];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            ['id' => 1, 'name' => 'Taylor'],
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
                ->schema([
                    Text::make('')->dataKey('text', 'name'),
                    Text::make('')->dataKey('text', 'sku'),
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

#[AsTable('workbench.hidden-column-users')]
class WorkbenchHiddenColumnUsersTable extends TableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name'),
            TextColumn::make('secret')->visible(false),
        ];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            [
                'name' => 'Taylor',
                'secret' => 'top-secret',
            ],
        ]));
    }
}

#[AsTable('workbench.hidden-badge-helper-users')]
class WorkbenchHiddenBadgeHelperUsersTable extends TableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('status')->badge('helper'),
            TextColumn::make('helper')->visible(false),
        ];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            [
                'status' => 'Active',
                'helper' => 'green',
            ],
        ]));
    }
}

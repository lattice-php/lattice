<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Lattice\Actions\Components\Action;
use Lattice\Core\Enums\Op;
use Lattice\Core\Facades\Lattice;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\StackColumn;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\Enums\PaginationType;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;
use Lattice\Tests\Fixtures\Workbench\WorkbenchPingAction;
use Lattice\Ui\Components\Link;
use Lattice\Ui\Components\Text;
use Workbench\App\Models\Product;

use function Pest\Laravel\getJson;

test('registered tables serialize their configured endpoint columns state and initial data', function (): void {
    Lattice::tables([WorkbenchUsersTable::class]);

    $table = wire(Table::use(WorkbenchUsersTable::class));

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.users',
            'props' => [
                'endpoint' => '/lattice/tables/workbench.users',
                'ref' => $this->latticeRef($table),
                'layout' => null,
                'bulkActions' => [],
                'toolbar' => [],
                'striped' => false,
                'searchable' => false,
                'lazy' => false,
                'resizableColumns' => false,
                'resizeIndicator' => false,
                'actionsLabel' => null,
                'emptyLabel' => null,
                'filters' => [],
                'perPageOptions' => [],
                'syncQuery' => false,
                'queryKey' => null,
                'defaultPerPage' => 25,
                'columns' => [
                    [
                        'key' => 'name',
                        'type' => 'column.text',
                        'props' => [
                            'label' => 'Name',
                            'sortable' => true,
                            'toggleable' => false,
                            'hiddenByDefault' => false,
                            'options' => [],
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
                            'pinned' => null,
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
                            'options' => [],
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
                            'pinned' => null,
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
                            'options' => [],
                            'filter' => null,
                            'date' => null,
                            'copyable' => false,
                            'link' => null,
                            'badge' => null,
                            'multiple' => null,
                            'width' => 'md',
                            'align' => 'start',
                            'pinned' => null,
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
                    'mode' => null,
                ],
                'pagination' => null,
                'pinnableColumns' => false,
            ],
        ]);
});

test('registered tables can serialize lazily without running their query', function (): void {
    Lattice::tables([WorkbenchLazyUsersTable::class]);

    $table = wire(Table::lazy(WorkbenchLazyUsersTable::class));

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.lazy-users',
            'props' => [
                'endpoint' => '/lattice/tables/workbench.lazy-users',
                'lazy' => true,
                'ref' => $this->latticeRef($table),
                'layout' => null,
                'bulkActions' => [],
                'toolbar' => [],
                'striped' => false,
                'searchable' => false,
                'resizableColumns' => false,
                'resizeIndicator' => false,
                'actionsLabel' => null,
                'emptyLabel' => null,
                'filters' => [],
                'perPageOptions' => [],
                'syncQuery' => false,
                'queryKey' => null,
                'defaultPerPage' => 25,
                'columns' => [
                    [
                        'key' => 'name',
                        'type' => 'column.text',
                        'props' => [
                            'label' => 'Name',
                            'sortable' => false,
                            'toggleable' => false,
                            'hiddenByDefault' => false,
                            'options' => [],
                            'filter' => null,
                            'date' => null,
                            'copyable' => false,
                            'link' => null,
                            'badge' => null,
                            'multiple' => null,
                            'width' => 'md',
                            'align' => 'start',
                            'pinned' => null,
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
                    'mode' => null,
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
                'pinnableColumns' => false,
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
                    'options' => [],
                    'filter' => null,
                    'width' => 'xl',
                    'align' => 'start',
                    'pinned' => null,
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
                    'options' => [],
                    'filter' => null,
                    'date' => null,
                    'copyable' => false,
                    'link' => null,
                    'badge' => null,
                    'multiple' => null,
                    'width' => 'md',
                    'align' => 'start',
                    'pinned' => null,
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

    expect(array_keys($row))->toBe(['id', 'name', 'sku', 'status', 'actions', 'rowUrl'])
        ->and($row['id'])->toBe($product->getKey())
        ->and($row['name'])->toBe('Projected Product')
        ->and($row['sku'])->toBe('PROJECT-001')
        ->and($row['status'])->toBe('active')
        ->and($row['actions'][0]['type'])->toBe('link')
        ->and($row['actions'][0]['key'])->toBe('edit-product')
        ->and($row['actions'][0]['props']['href'])->toBe("/products/{$product->getKey()}/edit")
        ->and($row['rowUrl'])->toBe("/products/{$product->getKey()}");
});

test('registered table responses omit the row url when a table declares no rowUrl', function (): void {
    Lattice::tables([WorkbenchUsersTable::class]);

    $row = wire(Table::use(WorkbenchUsersTable::class))['props']['data'][0];

    expect($row)->not->toHaveKey('rowUrl');
});

test('registered table responses prune hidden columns from the row payload', function (): void {
    Lattice::tables([WorkbenchHiddenColumnUsersTable::class]);

    $ref = $this->latticeRef(wire(Table::use(WorkbenchHiddenColumnUsersTable::class)));
    $row = $this->latticeGet('/lattice/tables/workbench.hidden-column-users', $ref)
        ->assertOk()
        ->json('data.0');

    expect($row)->toBeArray();

    expect(array_keys($row))->toBe(['name'])
        ->and($row)->not->toHaveKey('secret');
});

test('a badge colour key without a hidden column claiming it ships in the row payload', function (): void {
    Lattice::tables([WorkbenchBadgeHelperUsersTable::class]);

    $ref = $this->latticeRef(wire(Table::use(WorkbenchBadgeHelperUsersTable::class)));
    $row = $this->latticeGet('/lattice/tables/workbench.badge-helper-users', $ref)
        ->assertOk()
        ->json('data.0');

    expect($row)->toBeArray();

    expect(array_keys($row))->toBe(['status', 'helper'])
        ->and($row['helper'])->toBe('green');
});

test('a hidden column referenced by a visible badge column is still pruned from the row payload', function (): void {
    Lattice::tables([WorkbenchHiddenBadgeHelperUsersTable::class]);

    $ref = $this->latticeRef(wire(Table::use(WorkbenchHiddenBadgeHelperUsersTable::class)));
    $row = $this->latticeGet('/lattice/tables/workbench.hidden-badge-helper-users', $ref)
        ->assertOk()
        ->json('data.0');

    expect($row)->toBeArray();

    expect(array_keys($row))->toBe(['status'])
        ->and($row)->not->toHaveKey('helper');
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

    #[Override]
    public function rowUrl(array $row): ?string
    {
        return "/products/{$row['id']}";
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

#[AsTable('workbench.badge-helper-users')]
class WorkbenchBadgeHelperUsersTable extends TableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('status')->badge('helper'),
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

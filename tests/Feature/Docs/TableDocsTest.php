<?php
declare(strict_types=1);

use Lattice\Core\Color;
use Lattice\Core\Support\Wire;
use Lattice\Table\Columns\BadgeColumn;
use Lattice\Table\Columns\BooleanColumn;
use Lattice\Table\Columns\IconColumn;
use Lattice\Table\Columns\ImageColumn;
use Lattice\Table\Columns\MoneyColumn;
use Lattice\Table\Columns\NumberColumn;
use Lattice\Table\Columns\StackColumn;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Icon;
use Lattice\Ui\Enums\NumberFormatUnit;
use Lattice\Ui\Enums\Side;
use Lattice\Ui\Enums\Size;

describe('docs fixtures', function (): void {
    it('matches the overview table example fixture', function (): void {
        assertFixtureMatches('table.overview', Wire::toWire([
            Table::make('products')
                ->columns([
                    TextColumn::make('name')->label('Name')->sortable()->filterable(),
                    NumberColumn::make('price')->label('Price')->sortable()->filterable(),
                    BooleanColumn::make('featured')->label('Featured')->filterable(),
                    TextColumn::make('updated_at')->label('Updated')->dateTime()->sortable(),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['name' => 'Desk Lamp', 'price' => '49.00', 'featured' => true, 'updated_at' => '2026-05-30 09:15:00'],
                        ['name' => 'Office Chair', 'price' => '189.00', 'featured' => false, 'updated_at' => '2026-06-02 14:40:00'],
                        ['name' => 'Monitor Stand', 'price' => '75.50', 'featured' => true, 'updated_at' => '2026-06-08 08:05:00'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the search table example fixture', function (): void {
        assertFixtureMatches('table.search', Wire::toWire([
            Table::make('directory')
                ->searchable()
                ->columns([
                    TextColumn::make('name')->label('Name')->sortable()->searchable(),
                    TextColumn::make('email')->label('Email')->link('mailto:{value}')->searchable(),
                    TextColumn::make('team')->label('Team'),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['name' => 'Ada Lovelace', 'email' => 'ada@example.com', 'team' => 'Engineering'],
                        ['name' => 'Grace Hopper', 'email' => 'grace@example.com', 'team' => 'Engineering'],
                        ['name' => 'Katherine Johnson', 'email' => 'katherine@example.com', 'team' => 'Research'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the stack column table example fixture', function (): void {
        assertFixtureMatches('table.stack', Wire::toWire([
            Table::make('users')
                ->columns([
                    StackColumn::make('identity')->label('User')->schema([
                        Text::make('')->dataKey('text', 'name')->color(Color::default()),
                        Text::make('')->dataKey('text', 'email')->size(Size::Sm),
                    ]),
                    TextColumn::make('role')->label('Role'),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['name' => 'Ada Lovelace', 'email' => 'ada@example.com', 'role' => 'Admin'],
                        ['name' => 'Alan Turing', 'email' => 'alan@example.com', 'role' => 'Editor'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the toggleable columns table example fixture', function (): void {
        assertFixtureMatches('table.toggleable', Wire::toWire([
            Table::make('products')
                ->columns([
                    TextColumn::make('name')->label('Name'),
                    TextColumn::make('sku')->label('SKU')->toggleable(),
                    NumberColumn::make('price')->label('Price')->toggleable(),
                    TextColumn::make('updated_at')->label('Updated')->dateTime()->toggleable(hiddenByDefault: true),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'price' => '49.00', 'updated_at' => '2026-05-30 09:15:00'],
                        ['name' => 'Office Chair', 'sku' => 'CHAIR-2', 'price' => '189.00', 'updated_at' => '2026-06-02 14:40:00'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the pinned columns table example fixture', function (): void {
        assertFixtureMatches('table.pinned', Wire::toWire([
            Table::make('products')
                ->pinnableColumns()
                ->columns([
                    TextColumn::make('sku')->label('SKU')->pinned(),
                    TextColumn::make('name')->label('Name'),
                    NumberColumn::make('price')->label('Price'),
                    BadgeColumn::make('status')->label('Status')
                        ->colors(['active' => 'green', 'archived' => 'gray'])
                        ->pinned(Side::End),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['sku' => 'LAMP-1', 'name' => 'Desk Lamp', 'price' => '49.00', 'status' => 'active'],
                        ['sku' => 'CHAIR-2', 'name' => 'Office Chair', 'price' => '189.00', 'status' => 'archived'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the column types table example fixture', function (): void {
        assertFixtureMatches('table.column-types', Wire::toWire([
            Table::make('members')
                ->columns([
                    ImageColumn::make('avatar')->label('')->circular()->size(32),
                    TextColumn::make('name')->label('Name'),
                    BadgeColumn::make('status')->label('Status')
                        ->colors(['active' => 'green', 'invited' => 'yellow', 'archived' => 'gray']),
                    IconColumn::make('verified')->label('Verified')
                        ->icons(['1' => Icon::Check, '0' => Icon::Minus])
                        ->colors(['1' => 'green', '0' => 'gray']),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['avatar' => 'https://i.pravatar.cc/64?img=1', 'name' => 'Ada Lovelace', 'status' => 'active', 'verified' => '1'],
                        ['avatar' => 'https://i.pravatar.cc/64?img=2', 'name' => 'Alan Turing', 'status' => 'invited', 'verified' => '0'],
                        ['avatar' => 'https://i.pravatar.cc/64?img=3', 'name' => 'Grace Hopper', 'status' => 'archived', 'verified' => '1'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the text column example fixture', function (): void {
        assertFixtureMatches('table.text', Wire::toWire([
            Table::make('people')
                ->columns([
                    TextColumn::make('name')->label('Name')->link('/people/{value}')->sortable(),
                    TextColumn::make('email')->label('Email')->link('mailto:{value}')->copyable(),
                    TextColumn::make('joined_at')->label('Joined')->date()->sortable(),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['name' => 'Ada Lovelace', 'email' => 'ada@example.com', 'joined_at' => '2026-01-14 09:00:00'],
                        ['name' => 'Alan Turing', 'email' => 'alan@example.com', 'joined_at' => '2026-02-03 12:30:00'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the number column example fixture', function (): void {
        assertFixtureMatches('table.number', Wire::toWire([
            Table::make('metrics')
                ->columns([
                    TextColumn::make('label')->label('Metric'),
                    NumberColumn::make('views')->label('Views')->compact()->sortable(),
                    NumberColumn::make('conversion')->label('Conversion')
                        ->unit(NumberFormatUnit::Percent)->decimals(1),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['label' => 'Landing page', 'views' => 12400, 'conversion' => 12.8],
                        ['label' => 'Pricing', 'views' => 3820, 'conversion' => 6.4],
                        ['label' => 'Blog', 'views' => 1045000, 'conversion' => 1.1],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the money column example fixture', function (): void {
        assertFixtureMatches('table.money', Wire::toWire([
            Table::make('invoices')
                ->columns([
                    TextColumn::make('number')->label('Invoice'),
                    MoneyColumn::make('total')->label('Total')->currency('EUR')->sortable(),
                    MoneyColumn::make('refunded')->label('Refunded')->currencyField('currency'),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['number' => 'INV-1001', 'total' => '189.00', 'refunded' => '0.00', 'currency' => 'USD'],
                        ['number' => 'INV-1002', 'total' => '49.50', 'refunded' => '49.50', 'currency' => 'GBP'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the boolean column example fixture', function (): void {
        assertFixtureMatches('table.boolean', Wire::toWire([
            Table::make('flags')
                ->columns([
                    TextColumn::make('name')->label('Name'),
                    BooleanColumn::make('featured')->label('Featured')->sortable()->filterable(),
                    BooleanColumn::make('archived')->label('Archived'),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['name' => 'Desk Lamp', 'featured' => true, 'archived' => false],
                        ['name' => 'Office Chair', 'featured' => false, 'archived' => false],
                        ['name' => 'Monitor Stand', 'featured' => true, 'archived' => true],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the badge column example fixture', function (): void {
        assertFixtureMatches('table.badge', Wire::toWire([
            Table::make('orders')
                ->columns([
                    TextColumn::make('reference')->label('Reference'),
                    BadgeColumn::make('status')->label('Status')
                        ->colors(['paid' => 'green', 'pending' => 'yellow', 'refunded' => 'gray'])
                        ->filterable(),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['reference' => 'ORD-501', 'status' => 'paid'],
                        ['reference' => 'ORD-502', 'status' => 'pending'],
                        ['reference' => 'ORD-503', 'status' => 'refunded'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the icon column example fixture', function (): void {
        assertFixtureMatches('table.icon', Wire::toWire([
            Table::make('checks')
                ->columns([
                    TextColumn::make('name')->label('Name'),
                    IconColumn::make('verified')->label('Verified')
                        ->icons(['1' => Icon::Check, '0' => Icon::Minus])
                        ->colors(['1' => 'green', '0' => 'gray']),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['name' => 'Ada Lovelace', 'verified' => '1'],
                        ['name' => 'Alan Turing', 'verified' => '0'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });

    it('matches the image column example fixture', function (): void {
        assertFixtureMatches('table.image', Wire::toWire([
            Table::make('members')
                ->columns([
                    ImageColumn::make('avatar')->label('')->circular()->size(32),
                    TextColumn::make('name')->label('Name'),
                    TextColumn::make('role')->label('Role'),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['avatar' => 'https://i.pravatar.cc/64?img=1', 'name' => 'Ada Lovelace', 'role' => 'Admin'],
                        ['avatar' => 'https://i.pravatar.cc/64?img=2', 'name' => 'Alan Turing', 'role' => 'Editor'],
                    ])),
                    TableQuery::empty(),
                ),
        ]));
    });
});

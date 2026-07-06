<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Core\Enums\NumberFormatUnit;
use Lattice\Lattice\Tables\Columns\BadgeColumn;
use Lattice\Lattice\Tables\Columns\BooleanColumn;
use Lattice\Lattice\Tables\Columns\IconColumn;
use Lattice\Lattice\Tables\Columns\ImageColumn;
use Lattice\Lattice\Tables\Columns\MoneyColumn;
use Lattice\Lattice\Tables\Columns\NumberColumn;
use Lattice\Lattice\Tables\Columns\StackColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;

describe('docs fixtures', function (): void {
    it('dumps the overview table example', function (): void {
        dumpFixture('table.overview', [
            Table::make('products')
                ->striped(true)
                ->columns([
                    TextColumn::make('name')->label('Name')->sortable()->filterable(),
                    NumberColumn::make('price')->label('Price')->sortable()->filterable(),
                    BooleanColumn::make('featured')->label('Featured'),
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
        ]);

        expect('docs/fixtures/table.overview.json')->toBeReadableFile();
    });

    it('dumps the stack column table example', function (): void {
        dumpFixture('table.stack', [
            Table::make('users')
                ->columns([
                    StackColumn::make('identity')->label('User')->columns([
                        TextColumn::make('name')->label('Name')->sortable(),
                        TextColumn::make('email')->label('Email')->copyable(),
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
        ]);

        expect('docs/fixtures/table.stack.json')->toBeReadableFile();
    });

    it('dumps the toggleable columns table example', function (): void {
        dumpFixture('table.toggleable', [
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
        ]);

        expect('docs/fixtures/table.toggleable.json')->toBeReadableFile();
    });

    it('dumps the column types table example', function (): void {
        dumpFixture('table.column-types', [
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
        ]);

        expect('docs/fixtures/table.column-types.json')->toBeReadableFile();
    });

    it('dumps the text column example', function (): void {
        dumpFixture('table.text', [
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
        ]);

        expect('docs/fixtures/table.text.json')->toBeReadableFile();
    });

    it('dumps the number column example', function (): void {
        dumpFixture('table.number', [
            Table::make('metrics')
                ->columns([
                    TextColumn::make('label')->label('Metric'),
                    NumberColumn::make('views')->label('Views')->compact()->sortable(),
                    NumberColumn::make('conversion')->label('Conversion')
                        ->unit(NumberFormatUnit::Percent)->decimals(1),
                ])
                ->result(
                    TableResult::fromItems(collect([
                        ['label' => 'Landing page', 'views' => 12400, 'conversion' => 0.128],
                        ['label' => 'Pricing', 'views' => 3820, 'conversion' => 0.064],
                        ['label' => 'Blog', 'views' => 1045000, 'conversion' => 0.011],
                    ])),
                    TableQuery::empty(),
                ),
        ]);

        expect('docs/fixtures/table.number.json')->toBeReadableFile();
    });

    it('dumps the money column example', function (): void {
        dumpFixture('table.money', [
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
        ]);

        expect('docs/fixtures/table.money.json')->toBeReadableFile();
    });

    it('dumps the boolean column example', function (): void {
        dumpFixture('table.boolean', [
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
        ]);

        expect('docs/fixtures/table.boolean.json')->toBeReadableFile();
    });

    it('dumps the badge column example', function (): void {
        dumpFixture('table.badge', [
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
        ]);

        expect('docs/fixtures/table.badge.json')->toBeReadableFile();
    });

    it('dumps the icon column example', function (): void {
        dumpFixture('table.icon', [
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
        ]);

        expect('docs/fixtures/table.icon.json')->toBeReadableFile();
    });

    it('dumps the image column example', function (): void {
        dumpFixture('table.image', [
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
        ]);

        expect('docs/fixtures/table.image.json')->toBeReadableFile();
    });
});

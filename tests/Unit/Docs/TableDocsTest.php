<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Tables\Columns\BadgeColumn;
use Lattice\Lattice\Tables\Columns\BooleanColumn;
use Lattice\Lattice\Tables\Columns\IconColumn;
use Lattice\Lattice\Tables\Columns\ImageColumn;
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
});

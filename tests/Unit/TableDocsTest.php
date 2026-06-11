<?php

declare(strict_types=1);

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
                    TextColumn::make('price')->label('Price')->numeric()->sortable()->filterable(),
                    TextColumn::make('featured')->label('Featured')->boolean(),
                    TextColumn::make('updated_at')->label('Updated')->date('Y-m-d')->sortable(),
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
});

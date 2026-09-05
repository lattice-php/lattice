<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\CheckboxGroup;

it('lays a bare column count out from the md breakpoint up', function (): void {
    expect(wire(CheckboxGroup::make('permissions')->columns(2))['props']['columns'])
        ->toBe(['md' => 2]);
});

it('rejects a column count below one', function (): void {
    expect(fn (): CheckboxGroup => CheckboxGroup::make('permissions')->columns(['default' => 0]))
        ->toThrow(InvalidArgumentException::class);
});

it('carries the section label, description, and tooltip of each option', function (): void {
    $option = wire(CheckboxGroup::make('permissions')->options([
        CheckboxGroup::option('Manage orders', 'order:manage', description: 'order:manage', group: 'Sales', tooltip: 'Includes refunds'),
    ]))['props']['options'][0];

    expect($option)->toBe([
        'label' => 'Manage orders',
        'value' => 'order:manage',
        'data' => null,
        'description' => 'order:manage',
        'group' => 'Sales',
        'tooltip' => 'Includes refunds',
    ]);
});

it('starts every section collapsed only when asked', function (): void {
    $props = wire(CheckboxGroup::make('permissions')->collapsible(collapsed: true))['props'];

    expect($props['collapsible'])->toBeTrue()
        ->and($props['collapsed'])->toBeTrue();
});

describe('docs fixtures', function (): void {
    it('matches the checkbox group example fixture', function (): void {
        assertFixtureMatches('checkbox-group.basic', Wire::toWire([
            CheckboxGroup::make('notifications', 'Notifications')->options([
                CheckboxGroup::option('Product updates', 'product'),
                CheckboxGroup::option('Security alerts', 'security'),
                CheckboxGroup::option('Weekly digest', 'digest'),
            ]),
        ]));
    });

    it('matches the grouped checkbox group example fixture', function (): void {
        assertFixtureMatches('checkbox-group.groups', Wire::toWire([
            CheckboxGroup::make('permissions', 'Permissions')
                ->columns(2)
                ->bulkToggleable()
                ->collapsible()
                ->options([
                    CheckboxGroup::option('View orders', 'order:view', description: 'order:view', group: 'Sales'),
                    CheckboxGroup::option('Manage orders', 'order:manage', description: 'order:manage', group: 'Sales'),
                    CheckboxGroup::option('View invoices', 'invoice:view', description: 'invoice:view', group: 'Accounting'),
                    CheckboxGroup::option('Manage invoices', 'invoice:manage', description: 'invoice:manage', group: 'Accounting'),
                ]),
        ]));
    });
});

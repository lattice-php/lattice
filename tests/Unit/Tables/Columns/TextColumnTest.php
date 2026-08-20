<?php
declare(strict_types=1);

use Lattice\Table\Columns\TextColumn;

it('binds link placeholder keys into the row keys so projection keeps them', function (): void {
    expect(TextColumn::make('account.display_name')->link('/accounts/{account_id}?from={value}')->boundRowKeys())
        ->toBe(['account.display_name', 'account_id']);
});

it('binds the badge colour key for a scalar badge column', function (): void {
    expect(TextColumn::make('status')->badge('status_color')->boundRowKeys())
        ->toBe(['status', 'status_color']);
});

it('binds only its own key for a multiple badge column', function (): void {
    expect(TextColumn::make('tags')->multiple('slug')->badge()->boundRowKeys())->toBe(['tags']);
});

it('binds only its own key for a value-only link', function (): void {
    expect(TextColumn::make('url')->link()->boundRowKeys())->toBe(['url']);
});

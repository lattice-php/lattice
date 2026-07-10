<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Forms\Components\RowAction;

/**
 * @return array<string, mixed>
 */
function serializeRowAction(RowAction $action): array
{
    return wire($action);
}

it('serialises the built-in duplicate action with client-defaulted label and icon', function (): void {
    $wire = serializeRowAction(RowAction::duplicate());

    expect($wire)->toHaveCount(5)
        ->and($wire)->toMatchArray([
            'type' => 'duplicate',
            'key' => 'duplicate',
            'label' => null,
            'icon' => null,
            'destructive' => false,
        ]);
});

it('marks the remove action destructive by default', function (): void {
    $wire = serializeRowAction(RowAction::remove());

    expect($wire['type'])->toBe('remove')
        ->and($wire['destructive'])->toBeTrue();
});

it('overrides label, icon and destructive fluently', function (): void {
    $wire = serializeRowAction(
        RowAction::duplicate()->label('Clone')->icon('files')->destructive(),
    );

    expect($wire['label'])->toBe('Clone')
        ->and($wire['icon'])->toBe('files')
        ->and($wire['destructive'])->toBeTrue();
});

it('accepts a backed enum icon, like every other builder', function (): void {
    $wire = serializeRowAction(RowAction::duplicate()->icon(Icon::Copy));

    expect($wire['icon'])->toBe('copy');
});

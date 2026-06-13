<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\RowAction;

/**
 * @return array<string, mixed>
 */
function serializeRowAction(RowAction $action): array
{
    return json_decode(json_encode($action, JSON_THROW_ON_ERROR), true);
}

it('serialises the built-in duplicate action with client-defaulted label and icon', function (): void {
    expect(serializeRowAction(RowAction::duplicate()))->toBe([
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

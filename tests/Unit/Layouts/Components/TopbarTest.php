<?php
declare(strict_types=1);

use Lattice\Lattice\Layouts\Components\Topbar;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\Side;

test('the topbar serializes to its wire type, not sticky by default', function (): void {
    $wire = Topbar::make('app-topbar')->jsonSerialize();

    expect($wire['type'])->toBe('topbar')
        ->and($wire['props']['sticky'])->toBeFalse();
});

test('sticky() marks the topbar sticky', function (): void {
    $wire = Topbar::make()->sticky()->jsonSerialize();

    expect($wire['props']['sticky'])->toBeTrue();
});

test('float() pushes a stack along the main axis', function (): void {
    $wire = Stack::make()->float(Side::End)->jsonSerialize();

    expect($wire['props']['float'])->toBe('end');
});

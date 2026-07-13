<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Effects\Builtin\Callout;
use Lattice\Lattice\Ui\Enums\Variant;

test('a callout serializes its variant, title, body, dismissibility and action', function (): void {
    $wire = wire(
        Callout::make(Variant::Warning, 'Your trial ends in 3 days.')
            ->title('Trial ending')
            ->dismissible(false)
            ->link('Upgrade', '/billing', HttpMethod::Get),
    );

    expect($wire['type'])->toBe('callout')
        ->and($wire['props']['variant'])->toBe('warning')
        ->and($wire['props']['title'])->toBe('Trial ending')
        ->and($wire['props']['message'])->toBe('Your trial ends in 3 days.')
        ->and($wire['props']['dismissible'])->toBeFalse()
        ->and($wire['props']['action']['type'])->toBe('link')
        ->and($wire['props']['action']['props']['label'])->toBe('Upgrade');
});

test('a callout defaults to dismissible with no title or action', function (): void {
    $wire = wire(Callout::make(Variant::Info, 'Heads up.'));

    expect($wire['props']['title'])->toBeNull()
        ->and($wire['props']['dismissible'])->toBeTrue()
        ->and($wire['props']['action'])->toBeNull();
});

<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;

test('a callout serializes its variant, title, body, dismissibility and action', function () {
    $wire = wire(
        Callout::make(Variant::Warning, 'Your trial ends in 3 days.')
            ->title('Trial ending')
            ->dismissible(false)
            ->link('Upgrade', '/billing', HttpMethod::Get),
    );

    expect($wire['variant'])->toBe('warning')
        ->and($wire['title'])->toBe('Trial ending')
        ->and($wire['message'])->toBe('Your trial ends in 3 days.')
        ->and($wire['dismissible'])->toBeFalse()
        ->and($wire['action']['type'])->toBe('link')
        ->and($wire['action']['props']['label'])->toBe('Upgrade');
});

test('a callout defaults to dismissible with no title or action', function () {
    $wire = wire(Callout::make(Variant::Info, 'Heads up.'));

    expect($wire['title'])->toBeNull()
        ->and($wire['dismissible'])->toBeTrue()
        ->and($wire['action'])->toBeNull();
});

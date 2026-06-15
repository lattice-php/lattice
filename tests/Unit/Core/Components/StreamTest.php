<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Components\Stream;

test('stream component serializes endpoint, auto, and placeholder', function (): void {
    $wired = wire(
        Stream::make('assistant')
            ->endpoint('/stream')
            ->auto(false)
            ->placeholder('Ask something'),
    );

    expect($wired['type'])->toBe('stream')
        ->and($wired['key'])->toBe('assistant')
        ->and($wired['props']['endpoint'])->toBe('/stream')
        ->and($wired['props']['auto'])->toBeFalse()
        ->and($wired['props']['placeholder'])->toBe('Ask something');
});

test('stream component defaults auto to true with no placeholder', function (): void {
    $wired = wire(Stream::make('demo')->endpoint('/x'));

    expect($wired['props']['auto'])->toBeTrue()
        ->and($wired['props']['placeholder'])->toBeNull();
});

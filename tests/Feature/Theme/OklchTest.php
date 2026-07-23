<?php
declare(strict_types=1);

use Lattice\Lattice\Support\Theme\Oklch;

it('converts hex and rgb to oklch matching the JS reference', function (): void {
    expect(Oklch::normalizeToOklch('#ffffff'))->toBe('oklch(1 0 0)');
    expect(Oklch::normalizeToOklch('#000000'))->toBe('oklch(0 0 0)');
    expect(Oklch::normalizeToOklch('#6366f1'))->toBe('oklch(0.585 0.204 277.117)');
    expect(Oklch::normalizeToOklch('rgb(99, 102, 241)'))->toBe('oklch(0.585 0.204 277.117)');
});

it('passes through an already-oklch value unchanged', function (): void {
    expect(Oklch::normalizeToOklch('oklch(0.55 0.2 265)'))->toBe('oklch(0.55 0.2 265)');
});

it('passes through a non-derivable color unchanged', function (): void {
    expect(Oklch::normalizeToOklch('rebeccapurple'))->toBe('rebeccapurple');
});

it('shifts lightness and derives foreground', function (): void {
    expect(Oklch::shiftLightness('oklch(0.48 0.092 182)', -0.05))->toBe('oklch(0.43 0.092 182)');
    expect(Oklch::readableForeground('oklch(0.9 0.05 100)'))->toBe('oklch(0.205 0 0)');
    expect(Oklch::readableForeground('oklch(0.48 0.092 182)'))->toBe('oklch(0.985 0 0)');
});

it('clamps shifted lightness to [0, 1]', function (): void {
    expect(Oklch::shiftLightness('oklch(0.98 0.05 100)', 0.5))->toBe('oklch(1 0.05 100)');
    expect(Oklch::shiftLightness('oklch(0.02 0.05 100)', -0.5))->toBe('oklch(0 0.05 100)');
});

it('returns non-oklch input unchanged from shiftLightness', function (): void {
    expect(Oklch::shiftLightness('#6366f1', -0.05))->toBe('#6366f1');
});

it('returns the light foreground for non-oklch input', function (): void {
    expect(Oklch::readableForeground('#6366f1'))->toBe('oklch(0.985 0 0)');
});

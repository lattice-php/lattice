<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Theme\ColorGroup;
use Lattice\Lattice\Theme\Swatch;
use Lattice\Lattice\Theme\Theme;

it('builds a group from a string base and fills slots through withers', function (): void {
    $group = ColorGroup::make('#4f46e5')
        ->foreground('#ffffff')
        ->hover('#4338ca')
        ->active('#3730a3');

    expect($group->color->value)->toBe('#4f46e5')
        ->and($group->foreground?->value)->toBe('#ffffff')
        ->and($group->hover?->value)->toBe('#4338ca')
        ->and($group->active?->value)->toBe('#3730a3');
});

it('is immutable — a wither leaves the original untouched', function (): void {
    $group = ColorGroup::make('#4f46e5');
    $group->foreground('#ffffff');

    expect($group->foreground)->toBeNull();
});

it('rejects a named Color as a slot value', function (): void {
    ColorGroup::make(Color::primary());
})->throws(InvalidArgumentException::class);

it('round-trips through toArray and fromArray including dark counterparts', function (): void {
    $group = ColorGroup::make(Color::hex('#4f46e5')->dark('#818cf8'))
        ->foreground(Color::hex('#ffffff')->dark('#1e1b4b'));

    $rebuilt = ColorGroup::fromArray($group->toArray());

    expect($rebuilt->toArray())->toBe($group->toArray())
        ->and($rebuilt->color->dark)->toBe('#818cf8')
        ->and($rebuilt->hover)->toBeNull();
});

it('accepts plain strings per slot in fromArray', function (): void {
    $group = ColorGroup::fromArray(['color' => '#4f46e5', 'hover' => '#4338ca']);

    expect($group->color->value)->toBe('#4f46e5')
        ->and($group->hover?->value)->toBe('#4338ca')
        ->and($group->foreground)->toBeNull();
});

it('feeds a theme group exactly like spelled-out arguments', function (): void {
    $viaGroup = Theme::make()->primary(
        ColorGroup::make(Color::hex('#4f46e5')->dark('#818cf8'))
            ->foreground('#ffffff')
            ->hover('#4338ca'),
    );

    $viaArguments = Theme::make()->primary(
        Color::hex('#4f46e5')->dark('#818cf8'),
        foreground: '#ffffff',
        hover: '#4338ca',
    );

    expect($viaGroup->toCss())->toBe($viaArguments->toCss());
});

it('lets explicit arguments override group slots', function (): void {
    $css = Theme::make()
        ->primary(ColorGroup::make('#4f46e5')->foreground('#ffffff'), foreground: '#000000')
        ->toCss();

    expect($css)->toContain('--lt-primary-fg:#000000;')
        ->not->toContain('#ffffff');
});

it('is what a swatch expands to', function (): void {
    expect(Theme::make()->primary(Swatch::Indigo)->toCss())
        ->toBe(Theme::make()->primary(Swatch::Indigo->group())->toCss());
});

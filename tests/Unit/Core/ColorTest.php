<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorKind;
use Lattice\Lattice\Core\Enums\ColorName;

it('builds named colors from shortcuts', function (): void {
    $color = Color::success();

    expect($color->kind)->toBe(ColorKind::Named)
        ->and($color->value)->toBe('success')
        ->and($color->dark)->toBeNull();
});

it('coerces names, enum cases, css strings, and instances', function (): void {
    expect(Color::from('green'))->toEqual(Color::green())
        ->and(Color::from(ColorName::Danger))->toEqual(Color::danger())
        ->and(Color::from('#16a34a'))->toEqual(Color::css('#16a34a'))
        ->and(Color::from('var(--brand)'))->toEqual(Color::css('var(--brand)'))
        ->and(Color::from(Color::blue()))->toEqual(Color::blue());
});

it('accepts valid hex colors', function (string $hex): void {
    expect(Color::hex($hex)->value)->toBe($hex)
        ->and(Color::hex($hex)->kind)->toBe(ColorKind::Css);
})->with(['#fff', '#ffff', '#16a34a', '#16a34aff']);

it('rejects invalid hex colors', function (string $hex): void {
    Color::hex($hex);
})->with(['16a34a', '#16a34', '#zzz', 'red'])->throws(InvalidArgumentException::class);

it('carries a dark counterpart for css colors', function (): void {
    $color = Color::hex('#2563eb')->dark('#60a5fa');

    expect($color->value)->toBe('#2563eb')
        ->and($color->dark)->toBe('#60a5fa');
});

it('rejects dark() on named colors', function (): void {
    Color::green()->dark('#000');
})->throws(LogicException::class);

it('serializes to the tagged wire shape', function (): void {
    expect(wire(Color::warning()))
        ->toBe(['kind' => 'named', 'value' => 'warning', 'dark' => null])
        ->and(wire(Color::hex('#2563eb')->dark('#60a5fa')))
        ->toBe(['kind' => 'css', 'value' => '#2563eb', 'dark' => '#60a5fa']);
});

<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorKind;
use Lattice\Lattice\Core\Enums\ColorName;

it('builds named colors from shortcuts', function () {
    $color = Color::success();

    expect($color->kind)->toBe(ColorKind::Named)
        ->and($color->value)->toBe('success')
        ->and($color->dark)->toBeNull();
});

it('coerces names, enum cases, css strings, and instances', function () {
    expect(Color::from('green'))->toEqual(Color::green())
        ->and(Color::from(ColorName::Danger))->toEqual(Color::danger())
        ->and(Color::from('#16a34a'))->toEqual(Color::css('#16a34a'))
        ->and(Color::from('var(--brand)'))->toEqual(Color::css('var(--brand)'))
        ->and(Color::from(Color::blue()))->toEqual(Color::blue());
});

it('accepts valid hex colors', function (string $hex) {
    expect(Color::hex($hex)->value)->toBe($hex)
        ->and(Color::hex($hex)->kind)->toBe(ColorKind::Css);
})->with(['#fff', '#ffff', '#16a34a', '#16a34aff']);

it('rejects invalid hex colors', function (string $hex) {
    Color::hex($hex);
})->with(['16a34a', '#16a34', '#zzz', 'red'])->throws(InvalidArgumentException::class);

it('carries a dark counterpart for css colors', function () {
    $color = Color::hex('#2563eb')->dark('#60a5fa');

    expect($color->value)->toBe('#2563eb')
        ->and($color->dark)->toBe('#60a5fa');
});

it('rejects dark() on named colors', function () {
    Color::green()->dark('#000');
})->throws(LogicException::class);

it('serializes to the tagged wire shape', function () {
    expect(json_decode(json_encode(Color::warning()), true))
        ->toBe(['kind' => 'named', 'value' => 'warning', 'dark' => null])
        ->and(json_decode(json_encode(Color::hex('#2563eb')->dark('#60a5fa')), true))
        ->toBe(['kind' => 'css', 'value' => '#2563eb', 'dark' => '#60a5fa']);
});

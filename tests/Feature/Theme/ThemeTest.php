<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Support\Theme\Theme;

it('renders an empty theme as a :root and .dark block', function (): void {
    $css = Theme::make()->toCss();
    expect($css)->toContain(':root{')->toContain('.dark{')
        ->toContain('--primary:oklch(0.48 0.092 182)')
        ->toContain('--radius:0.5rem');
});

it('derives foreground for a hex brand color', function (): void {
    $css = Theme::make()->colors(primary: '#6366f1')->toCss();
    expect($css)->toContain('--primary:#6366f1')->toContain('--primary-foreground:oklch(0.985 0 0)');
});

it('accepts the Color value object and rejects named colors as inputs', function (): void {
    expect(Theme::make()->colors(danger: Color::hex('#e11d48'))->toCss())->toContain('--destructive:#e11d48');
    Theme::make()->colors(primary: Color::primary());
})->throws(InvalidArgumentException::class);

it('brands dark only via the dark block', function (): void {
    $css = Theme::make()->colors(primary: '#6366f1')
        ->dark(fn (Theme $t): Theme => $t->colors(primary: 'oklch(0.7 0.18 265)'))->toCss();
    expect($css)->toContain('--primary:oklch(0.7 0.18 265)');
});

it('matches the golden theme fixtures byte-for-byte', function (array $input, string $expected): void {
    expect(Theme::fromArray($input)->toCss())->toBe($expected);
})->with(function (): Generator {
    $fixtures = json_decode(
        file_get_contents(__DIR__.'/../../../resources/theme-fixtures.json'),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    foreach ($fixtures as $fixture) {
        yield $fixture['name'] => [$fixture['input'], $fixture['css']];
    }
});

it('lets a css Color carry its dark counterpart into the dark block', function (): void {
    $css = Theme::make()->colors(primary: Color::hex('#6366f1')->dark('oklch(0.7 0.18 265)'))->toCss();
    expect($css)
        ->toContain('--primary:#6366f1')
        ->toContain('.dark{--background:oklch(0.145 0 0);--foreground:oklch(0.985 0 0);--card:oklch(0.145 0 0);--popover:oklch(0.145 0 0);--primary:oklch(0.7 0.18 265);');
});

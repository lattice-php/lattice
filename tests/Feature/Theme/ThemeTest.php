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

it('lets a css Color carry its dark counterpart into the dark block', function (): void {
    $css = Theme::make()->colors(primary: Color::hex('#6366f1')->dark('oklch(0.7 0.18 265)'))->toCss();
    expect($css)
        ->toContain('--primary:#6366f1')
        ->toContain('.dark{--background:oklch(0.145 0 0);--foreground:oklch(0.985 0 0);--card:oklch(0.145 0 0);--popover:oklch(0.145 0 0);--primary:oklch(0.7 0.18 265);');
});

it('rejects theme values that could break out of the style rule', function (string $bad): void {
    Theme::make()->colors(primary: $bad)->toCss();
})->with(['red} html{color:red', 'red;background:url(//x)', '</style>'])->throws(InvalidArgumentException::class);

it('rejects unsafe scalar values', function (): void {
    Theme::make()->radius('1rem} *{display:none')->toCss();
})->throws(InvalidArgumentException::class);

<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Support\Theme\Theme;

it('emits a :root and .dark block from configured tokens only', function (): void {
    $css = Theme::make()->colors(primary: '#6366f1')->radius('0.75rem')->toCss();
    expect($css)->toBe(":root{--primary:#6366f1;--radius:0.75rem;}\n.dark{}");
});

it('maps friendly names to host-var tokens and accepts the Color VO', function (): void {
    $css = Theme::make()->colors(primaryForeground: '#ffffff', danger: Color::hex('#e11d48'))->toCss();
    expect($css)->toContain('--destructive:#e11d48;')->toContain('--primary-foreground:#ffffff;');
});

it('rejects a named Color as a theme input', function (): void {
    Theme::make()->colors(primary: Color::primary());
})->throws(InvalidArgumentException::class);

it('sets arbitrary tokens via set(), prefixing --', function (): void {
    expect(Theme::make()->set('primary-hover', '#4f46e5')->toCss())
        ->toContain('--primary-hover:#4f46e5;');
});

it('merges dark overrides only into the dark block', function (): void {
    $css = Theme::make()->colors(primary: '#6366f1')
        ->dark(fn (Theme $t): Theme => $t->colors(primary: '#818cf8'))->toCss();
    expect($css)->toBe(":root{--primary:#6366f1;}\n.dark{--primary:#818cf8;}");
});

it('builds the same result from fromArray as the fluent builder', function (): void {
    $fluent = Theme::make()->colors(primary: '#6366f1')->radius('0.75rem')
        ->dark(fn (Theme $t): Theme => $t->colors(primary: '#818cf8'))->toCss();
    $array = Theme::fromArray([
        'colors' => ['primary' => '#6366f1'],
        'radius' => '0.75rem',
        'dark' => ['colors' => ['primary' => '#818cf8']],
    ])->toCss();
    expect($array)->toBe($fluent);
});

it('rejects values that could break out of the style rule', function (string $bad): void {
    $css = Theme::make()->set('primary', $bad)->toCss();
})->with(['red}html{x:y', 'red;x:y', '</style>'])->throws(InvalidArgumentException::class);

it('rejects token names that could break out of the style rule', function (): void {
    Theme::make()->set('x}html{color:red', 'blue');
})->throws(InvalidArgumentException::class);

it('rejects a Color that carries a dark counterpart', function (): void {
    $css = Theme::make()->colors(primary: Color::hex('#6366f1')->dark('#818cf8'))->toCss();
})->throws(InvalidArgumentException::class);

it('maps the disabled token pair', function (): void {
    expect(Theme::make()->colors(disabled: '#eeeeee', disabledForeground: '#999999')->toCss())
        ->toContain('--disabled:#eeeeee;')
        ->toContain('--disabled-foreground:#999999;');
});

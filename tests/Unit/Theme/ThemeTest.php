<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Theme\Swatch;
use Lattice\Lattice\Theme\Theme;

it('emits only the configured tokens into the :root block', function (): void {
    $css = Theme::make()->primary('#6366f1')->radius('0.75rem')->toCss();

    expect($css)->toBe(":root{--lt-primary:#6366f1;--lt-radius:0.75rem;}\n.dark{}");
});

it('writes an interactive group with all four states', function (): void {
    $css = Theme::make()
        ->primary('#6366f1', foreground: '#ffffff', hover: '#4f46e5', active: '#4338ca')
        ->toCss();

    expect($css)
        ->toContain('--lt-primary:#6366f1;')
        ->toContain('--lt-primary-fg:#ffffff;')
        ->toContain('--lt-primary-hover:#4f46e5;')
        ->toContain('--lt-primary-active:#4338ca;');
});

it('leaves unset hover and active states to the stylesheet derivation', function (): void {
    expect(Theme::make()->danger('#e11d48')->toCss())
        ->toBe(":root{--lt-danger:#e11d48;}\n.dark{}");
});

it('writes pair and single tokens', function (): void {
    $css = Theme::make()
        ->background('#fafafa', foreground: '#18181b')
        ->surface('#ffffff')
        ->border('#e4e4e7')
        ->toCss();

    expect($css)
        ->toContain('--lt-bg:#fafafa;')
        ->toContain('--lt-fg:#18181b;')
        ->toContain('--lt-surface:#ffffff;')
        ->toContain('--lt-border:#e4e4e7;');
});

it('numbers chart colours from one', function (): void {
    expect(Theme::make()->chart(['#111111', '#222222'])->toCss())
        ->toContain('--lt-chart-1:#111111;')
        ->toContain('--lt-chart-2:#222222;');
});

it('rejects more than eight chart colours', function (): void {
    Theme::make()->chart(array_fill(0, 9, '#111111'));
})->throws(InvalidArgumentException::class);

it('splits a Color dark counterpart into the dark block', function (): void {
    $css = Theme::make()->primary(Color::hex('#6366f1')->dark('#818cf8'))->toCss();

    expect($css)->toBe(":root{--lt-primary:#6366f1;}\n.dark{--lt-primary:#818cf8;}");
});

it('expands a swatch into base, dark, and foreground', function (): void {
    $css = Theme::make()->primary(Swatch::Indigo)->toCss();

    expect($css)
        ->toContain(':root{--lt-primary:#4f46e5;--lt-primary-fg:#ffffff;}')
        ->toContain('.dark{--lt-primary:#818cf8;--lt-primary-fg:#1e1b4b;}');
});

it('lets an explicit foreground win over the swatch foreground', function (): void {
    expect(Theme::make()->primary(Swatch::Indigo, foreground: '#000000')->toCss())
        ->toContain('--lt-primary-fg:#000000;');
});

it('merges dark() overrides only into the dark block', function (): void {
    $css = Theme::make()
        ->primary('#6366f1')
        ->dark(fn (Theme $t): Theme => $t->primary('#818cf8'))
        ->toCss();

    expect($css)->toBe(":root{--lt-primary:#6366f1;}\n.dark{--lt-primary:#818cf8;}");
});

it('rejects a Color dark counterpart inside dark()', function (): void {
    Theme::make()->dark(fn (Theme $t): Theme => $t->primary(Color::hex('#111111')->dark('#222222')));
})->throws(InvalidArgumentException::class);

it('rejects a named Color as a theme input', function (): void {
    Theme::make()->primary(Color::primary());
})->throws(InvalidArgumentException::class);

it('sets arbitrary tokens via set(), prefixing --', function (): void {
    expect(Theme::make()->set('sidebar-w', '18rem')->toCss())
        ->toContain('--lt-sidebar-w:18rem;');
});

it('rejects values that could break out of the style rule', function (string $bad): void {
    Theme::make()->set('primary', $bad);
})->with(['red}html{x:y', 'red;x:y', '</style>'])->throws(InvalidArgumentException::class);

it('rejects token names that could break out of the style rule', function (): void {
    Theme::make()->set('x}html{color:red', 'blue');
})->throws(InvalidArgumentException::class);

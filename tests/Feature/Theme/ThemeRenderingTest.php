<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Theme\Theme;
use Lattice\Lattice\Theme\ThemeRenderer;

it('renders nothing when no theme is registered', function (): void {
    expect(new ThemeRenderer()->style())->toBe('');
});

it('renders a registered theme as a managed style tag', function (): void {
    Lattice::theme(Theme::make()->primary('#6366f1'));

    $style = app(ThemeRenderer::class)->style();

    expect($style)
        ->toStartWith('<style id="lattice-theme">')
        ->toContain('--lt-primary:#6366f1')
        ->toEndWith('</style>');
});

it('resolves a closure registration to a theme', function (): void {
    Lattice::theme(fn (): Theme => Theme::make()->primary('#22c55e'));

    expect(app(ThemeRenderer::class)->style())->toContain('--lt-primary:#22c55e');
});

it('renders nothing when a closure registration resolves to no theme', function (): void {
    $renderer = new ThemeRenderer;
    $renderer->register(fn (): ?Theme => null);

    expect($renderer->style())->toBe('');
});

it('renders the directive', function (): void {
    Lattice::theme(Theme::make()->radius('0.75rem'));

    expect(Blade::render('@latticeTheme'))->toContain('--lt-radius:0.75rem');
});

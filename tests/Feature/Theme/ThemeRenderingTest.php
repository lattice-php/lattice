<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Support\Theme\Theme;
use Lattice\Lattice\Support\Theme\ThemeRenderer;

it('renders nothing when no theme is configured', function (): void {
    config()->set('lattice.frontend.theme', []);

    expect(app(ThemeRenderer::class)->style())->toBe('');
});

it('renders a registered theme as a managed style tag', function (): void {
    Lattice::theme(Theme::make()->colors(primary: '#6366f1'));

    $style = app(ThemeRenderer::class)->style();

    expect($style)
        ->toStartWith('<style id="lattice-theme">')
        ->toContain('--primary:#6366f1')
        ->toEndWith('</style>');
});

it('falls back to config when nothing is registered', function (): void {
    config()->set('lattice.frontend.theme', ['colors' => ['primary' => '#e11d48']]);

    expect(app(ThemeRenderer::class)->style())->toContain('--primary:#e11d48');
});

it('renders a flat config map', function (): void {
    config()->set('lattice.frontend.theme', ['primary' => '#6366f1', '--lt-radius' => '0.5rem']);

    expect(app(ThemeRenderer::class)->style())
        ->toContain('--primary:#6366f1;')
        ->toContain('--lt-radius:0.5rem;');
});

it('renders every token of a mixed flat and structured config map', function (): void {
    config()->set('lattice.frontend.theme', ['radius' => '0.5rem', 'primary' => '#ffffff']);

    expect(app(ThemeRenderer::class)->style())
        ->toContain('--radius:0.5rem;')
        ->toContain('--primary:#ffffff;');
});

it('prefers a registered theme over config', function (): void {
    config()->set('lattice.frontend.theme', ['colors' => ['primary' => '#e11d48']]);
    Lattice::theme(Theme::make()->colors(primary: '#6366f1'));

    expect(app(ThemeRenderer::class)->style())
        ->toContain('--primary:#6366f1')
        ->not->toContain('#e11d48');
});

it('resolves a closure registration to a theme', function (): void {
    Lattice::theme(fn (): Theme => Theme::make()->colors(primary: '#22c55e'));

    expect(app(ThemeRenderer::class)->style())->toContain('--primary:#22c55e');
});

it('accepts an array registration', function (): void {
    Lattice::theme(['colors' => ['primary' => '#22c55e']]);

    expect(app(ThemeRenderer::class)->style())->toContain('--primary:#22c55e');
});

it('renders the directive', function (): void {
    Lattice::theme(Theme::make()->radius('0.75rem'));

    expect(Blade::render('@latticeTheme'))->toContain('--radius:0.75rem');
});

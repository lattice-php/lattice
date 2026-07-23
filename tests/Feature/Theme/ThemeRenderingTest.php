<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Support\Theme\Theme;
use Lattice\Lattice\Support\Theme\ThemeRenderer;

beforeEach(function (): void {
    $this->publicPath = sys_get_temp_dir().'/lattice-theme-public-'.uniqid();
    File::makeDirectory($this->publicPath.'/vendor/lattice', recursive: true);
    $this->app->usePublicPath($this->publicPath);

    File::put(public_path('vendor/lattice/manifest.json'), json_encode([
        'version' => '1.2.3',
        'files' => [
            'lattice.js' => 'jshash123456',
            'lattice.css' => 'csshash12345',
            'sprite.svg' => 'svghash12345',
        ],
    ], JSON_THROW_ON_ERROR));
});

afterEach(function (): void {
    File::deleteDirectory($this->publicPath);
});

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

it('resolves a closure registration to a theme', function (): void {
    Lattice::theme(fn (): Theme => Theme::make()->colors(primary: '#22c55e'));

    expect(app(ThemeRenderer::class)->style())->toContain('--primary:#22c55e');
});

it('renders the directive', function (): void {
    Lattice::theme(Theme::make()->radius('0.75rem'));

    expect(Blade::render('@latticeTheme'))->toContain('--radius:0.75rem');
});

it('routes a structured config through the standalone head as a managed style tag', function (): void {
    config()->set('lattice.frontend.theme', ['colors' => ['primary' => '#e11d48']]);

    expect(Blade::render('@latticeHead'))
        ->toContain('<style id="lattice-theme">')
        ->toContain('--primary:#e11d48');
});

it('keeps the legacy flat theme map working through the standalone head', function (): void {
    config()->set('lattice.frontend.theme', ['primary' => '#6366f1', '--lt-radius' => '0.5rem']);

    expect(Blade::render('@latticeHead'))
        ->toContain('<style>:root{--primary:#6366f1;--lt-radius:0.5rem;}</style>');
});

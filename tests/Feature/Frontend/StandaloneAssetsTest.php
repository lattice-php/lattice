<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Support\Frontend\StandaloneAssets;
use Lattice\Lattice\Support\Theme\Theme;
use Lattice\Lattice\Support\Theme\ThemeRenderer;

beforeEach(function (): void {
    $this->publicPath = sys_get_temp_dir().'/lattice-directives-public-'.uniqid();
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

it('renders the stylesheet link with the manifest hash', function (): void {
    expect(Blade::render('@latticeHead'))
        ->toContain('<link rel="stylesheet" href="')
        ->toContain('vendor/lattice/lattice.css?v=csshash12345');
});

it('embeds the boot config with the versioned sprite url', function (): void {
    $html = Blade::render('@latticeHead');

    expect($html)->toContain('<script type="application/json" data-lattice-config>')
        ->and($html)->toContain('vendor/lattice/sprite.svg?v=svghash12345');
});

it('renders a registered theme as a managed style tag', function (): void {
    Lattice::theme(Theme::make()->colors(primary: '#6366f1'));

    expect(Blade::render('@latticeHead'))
        ->toContain('<style id="lattice-theme">')
        ->toContain('--primary:#6366f1');
});

it('renders no style tag when no theme is registered', function (): void {
    expect(Blade::render('@latticeHead'))->not->toContain('lattice-theme');
});

it('merges the directive argument over the configured frontend settings', function (): void {
    config()->set('lattice.frontend.echo', ['broadcaster' => 'reverb', 'key' => 'app-key']);

    expect(Blade::render('@latticeHead'))->toContain('"broadcaster":"reverb"');
    expect(Blade::render("@latticeHead(['echo' => null])"))->not->toContain('"broadcaster"');
});

it('renders the module script tag', function (): void {
    expect(Blade::render('@latticeScripts'))
        ->toContain('<script type="module" src="')
        ->toContain('vendor/lattice/lattice.js?v=jshash123456');
});

it('tells you to publish when the assets are missing', function (): void {
    File::deleteDirectory($this->publicPath.'/vendor/lattice');

    app(StandaloneAssets::class)->head();
})->throws(RuntimeException::class, 'php artisan lattice:assets');

it('throws on a version mismatch when debugging', function (): void {
    config()->set('app.debug', true);
    $this->app->instance(StandaloneAssets::class, new StandaloneAssets(app(ThemeRenderer::class), installedVersion: '9.9.9'));

    app(StandaloneAssets::class)->head();
})->throws(RuntimeException::class, 'do not match');

it('ignores a version mismatch when not debugging', function (): void {
    config()->set('app.debug', false);
    $this->app->instance(StandaloneAssets::class, new StandaloneAssets(app(ThemeRenderer::class), installedVersion: '9.9.9'));

    expect(Blade::render('@latticeHead'))->toContain('lattice.css');
});

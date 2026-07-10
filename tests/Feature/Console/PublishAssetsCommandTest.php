<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

beforeEach(function (): void {
    $this->publicPath = sys_get_temp_dir().'/lattice-assets-public-'.uniqid();
    File::makeDirectory($this->publicPath, recursive: true);
    $this->app->usePublicPath($this->publicPath);

    $this->distPath = sys_get_temp_dir().'/lattice-assets-dist-'.uniqid();
    File::makeDirectory($this->distPath.'/chunks', recursive: true);
    File::put($this->distPath.'/manifest.json', json_encode([
        'version' => '1.2.3',
        'files' => [
            'lattice.js' => 'abc123abc123',
            'lattice.css' => 'def456def456',
            'sprite.svg' => '789abc789abc',
            'chunks/rich-editor-x1y2z3.js' => '111222333444',
        ],
    ], JSON_THROW_ON_ERROR));
    File::put($this->distPath.'/lattice.js', 'export {};');
    File::put($this->distPath.'/lattice.css', ':root{}');
    File::put($this->distPath.'/sprite.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    File::put($this->distPath.'/chunks/rich-editor-x1y2z3.js', 'export {};');

    config()->set('lattice.frontend.dist_path', $this->distPath);
});

afterEach(function (): void {
    File::deleteDirectory($this->publicPath);
    File::deleteDirectory($this->distPath);
});

it('publishes the standalone bundle into the public directory', function (): void {
    artisan('lattice:assets')->assertSuccessful();

    expect(File::exists(public_path('vendor/lattice/lattice.js')))->toBeTrue()
        ->and(File::exists(public_path('vendor/lattice/chunks/rich-editor-x1y2z3.js')))->toBeTrue()
        ->and(json_decode(File::get(public_path('vendor/lattice/manifest.json')), true)['version'])->toBe('1.2.3');
});

it('removes files left over from a previous version', function (): void {
    File::makeDirectory(public_path('vendor/lattice/chunks'), recursive: true);
    File::put(public_path('vendor/lattice/chunks/stale-old.js'), 'stale');

    artisan('lattice:assets')->assertSuccessful();

    expect(File::exists(public_path('vendor/lattice/chunks/stale-old.js')))->toBeFalse();
});

it('fails when no standalone build is available', function (): void {
    config()->set('lattice.frontend.dist_path', $this->distPath.'/missing');

    artisan('lattice:assets')->assertFailed();
});

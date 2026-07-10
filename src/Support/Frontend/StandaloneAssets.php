<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\Frontend;

use Composer\InstalledVersions;
use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use RuntimeException;

final class StandaloneAssets
{
    /** @var array{version: string, files: array<string, string>}|null */
    private ?array $manifest = null;

    public function __construct(private readonly ?string $installedVersion = null) {}

    /** @param array<string, mixed> $config */
    public function head(array $config = []): string
    {
        $frontend = array_merge(config('lattice.frontend'), $config);

        $tags = [sprintf('<link rel="stylesheet" href="%s">', $this->versionedUrl('lattice.css'))];

        $theme = $frontend['theme'] ?? [];

        if ($theme !== []) {
            $tags[] = $this->themeStyle($theme);
        }

        $tags[] = $this->configScript($frontend);

        return implode("\n", $tags);
    }

    public function scripts(): string
    {
        return sprintf('<script type="module" src="%s"></script>', $this->versionedUrl('lattice.js'));
    }

    /** @param array<string, mixed> $frontend */
    private function configScript(array $frontend): string
    {
        $config = array_filter([
            'spriteUrl' => $this->versionedUrl('sprite.svg'),
            'echo' => $frontend['echo'] ?? null,
        ], static fn (mixed $value): bool => $value !== null);

        return sprintf(
            '<script type="application/json" data-lattice-config>%s</script>',
            json_encode($config, JSON_THROW_ON_ERROR | JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES),
        );
    }

    /** @param array<string, string> $theme */
    private function themeStyle(array $theme): string
    {
        $declarations = '';

        foreach ($theme as $key => $value) {
            if (preg_match('/[<>{}]/', $key.$value) === 1) {
                throw new InvalidArgumentException("Invalid characters in the [{$key}] theme value.");
            }

            $property = str_starts_with($key, '--') ? $key : '--'.$key;
            $declarations .= "{$property}:{$value};";
        }

        return "<style>:root{{$declarations}}</style>";
    }

    private function versionedUrl(string $file): string
    {
        $manifest = $this->manifest();

        return asset(config('lattice.frontend.path').'/'.$file).'?v='.($manifest['files'][$file] ?? $manifest['version']);
    }

    /** @return array{version: string, files: array<string, string>} */
    private function manifest(): array
    {
        if ($this->manifest !== null) {
            return $this->manifest;
        }

        $path = public_path(config('lattice.frontend.path').'/manifest.json');

        if (! File::exists($path)) {
            throw new RuntimeException('Lattice standalone assets are not published. Run `php artisan lattice:assets`.');
        }

        $manifest = json_decode(File::get($path), true, flags: JSON_THROW_ON_ERROR);

        $this->guardVersion($manifest['version']);

        return $this->manifest = $manifest;
    }

    private function guardVersion(string $published): void
    {
        if (config('app.debug') !== true) {
            return;
        }

        $installed = $this->installedVersion ?? (InstalledVersions::isInstalled('lattice-php/lattice')
            ? InstalledVersions::getPrettyVersion('lattice-php/lattice')
            : null);

        if ($installed !== null && preg_match('/^\d+\.\d+\.\d+$/', $installed) === 1 && $installed !== $published) {
            throw new RuntimeException(
                "The published Lattice assets ({$published}) do not match the installed package ({$installed}). Run `php artisan lattice:assets`.",
            );
        }
    }
}

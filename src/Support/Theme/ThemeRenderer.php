<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Theme;

use Closure;
use Lattice\Lattice\Support\Frontend\StandaloneAssets;

final class ThemeRenderer
{
    private const array STRUCTURED_KEYS = [
        'colors',
        'radius',
        'dark',
        'ringWidth',
        'borderWidth',
        'fontSans',
        'fontMono',
        'fontDisplay',
        'ringOffset',
    ];

    private Theme|Closure|null $theme = null;

    public function register(Theme|Closure $theme): void
    {
        $this->theme = $theme;
    }

    public function style(): string
    {
        $theme = $this->resolve();

        return $theme instanceof Theme ? self::wrap($theme) : '';
    }

    public static function wrap(Theme $theme): string
    {
        $css = $theme->toCss();

        StandaloneAssets::guardAgainstUnsafeCharacters('theme', $css, '/[<>]/');

        return '<style id="lattice-theme">'.$css.'</style>';
    }

    /**
     * @param  array<array-key, mixed>  $config
     */
    public static function isStructured(array $config): bool
    {
        return array_any(self::STRUCTURED_KEYS, fn (string $key): bool => array_key_exists($key, $config));
    }

    private function resolve(): ?Theme
    {
        $theme = $this->theme;

        if ($theme instanceof Closure) {
            $theme = $theme();
        }

        if ($theme instanceof Theme) {
            return $theme;
        }

        $config = config('lattice.frontend.theme', []);

        if (is_array($config) && self::isStructured($config)) {
            return Theme::fromArray($config);
        }

        return null;
    }
}

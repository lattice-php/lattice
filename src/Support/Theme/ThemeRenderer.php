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

        return $theme === null ? '' : self::wrap($theme);
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
        foreach (self::STRUCTURED_KEYS as $key) {
            if (array_key_exists($key, $config)) {
                return true;
            }
        }

        return false;
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

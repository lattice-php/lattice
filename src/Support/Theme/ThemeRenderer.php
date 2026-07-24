<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Theme;

use Closure;
use InvalidArgumentException;

final class ThemeRenderer
{
    /** @var Theme|array<string, mixed>|Closure|null */
    private Theme|array|Closure|null $theme = null;

    /** @param Theme|array<string, mixed>|Closure $theme */
    public function register(Theme|array|Closure $theme): void
    {
        $this->theme = $theme;
    }

    /**
     * Render the active theme: a registered theme wins, then the given config
     * value, then `lattice.frontend.theme`. Returns '' when none is set.
     */
    public function style(mixed $configTheme = null): string
    {
        $theme = $this->themeFrom($this->registered())
            ?? $this->themeFrom($configTheme ?? config('lattice.frontend.theme'));

        return $theme instanceof Theme ? self::wrap($theme) : '';
    }

    public static function wrap(Theme $theme): string
    {
        $css = $theme->toCss();

        if (preg_match('/[<>]/', $css) === 1) {
            throw new InvalidArgumentException('The theme CSS contains invalid characters.');
        }

        return '<style id="lattice-theme">'.$css.'</style>';
    }

    private function registered(): mixed
    {
        return $this->theme instanceof Closure ? ($this->theme)() : $this->theme;
    }

    private function themeFrom(mixed $theme): ?Theme
    {
        if ($theme instanceof Theme) {
            return $theme;
        }

        if (is_array($theme) && $theme !== []) {
            /** @var array<string, mixed> $theme */
            return Theme::fromArray($theme);
        }

        return null;
    }
}

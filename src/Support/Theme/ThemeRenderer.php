<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\Theme;

use Closure;
use InvalidArgumentException;

final class ThemeRenderer
{
    private Theme|Closure|null $theme = null;

    public function register(Theme|Closure $theme): void
    {
        $this->theme = $theme;
    }

    public function style(): string
    {
        $theme = $this->theme instanceof Closure ? ($this->theme)() : $this->theme;

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
}

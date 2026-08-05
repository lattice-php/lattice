<?php
declare(strict_types=1);

namespace Lattice\Theme;

use Lattice\Core\Color;

/**
 * Curated brand-colour presets: a tuned base for light mode, a lighter
 * counterpart for dark mode, and a foreground that keeps contrast in both.
 * `Theme::make()->primary(Swatch::Indigo)` is a complete one-line theme.
 */
enum Swatch
{
    case Teal;
    case Emerald;
    case Green;
    case Blue;
    case Indigo;
    case Violet;
    case Rose;
    case Red;
    case Orange;
    case Amber;

    public function group(): ColorGroup
    {
        $foreground = match ($this) {
            self::Amber => Color::hex('#451a03'),
            default => Color::hex('#ffffff')->dark($this->darkForeground()),
        };

        return ColorGroup::make(Color::hex($this->base())->dark($this->darkBase()))
            ->foreground($foreground);
    }

    private function base(): string
    {
        return match ($this) {
            self::Teal => '#0d9488',
            self::Emerald => '#059669',
            self::Green => '#16a34a',
            self::Blue => '#2563eb',
            self::Indigo => '#4f46e5',
            self::Violet => '#7c3aed',
            self::Rose => '#e11d48',
            self::Red => '#dc2626',
            self::Orange => '#ea580c',
            self::Amber => '#f59e0b',
        };
    }

    private function darkBase(): string
    {
        return match ($this) {
            self::Teal => '#2dd4bf',
            self::Emerald => '#34d399',
            self::Green => '#4ade80',
            self::Blue => '#60a5fa',
            self::Indigo => '#818cf8',
            self::Violet => '#a78bfa',
            self::Rose => '#fb7185',
            self::Red => '#f87171',
            self::Orange => '#fb923c',
            self::Amber => '#fbbf24',
        };
    }

    private function darkForeground(): string
    {
        return match ($this) {
            self::Teal => '#042f2e',
            self::Emerald => '#022c22',
            self::Green => '#052e16',
            self::Blue => '#172554',
            self::Indigo => '#1e1b4b',
            self::Violet => '#2e1065',
            self::Rose => '#4c0519',
            self::Red => '#450a0a',
            self::Orange => '#431407',
            self::Amber => '#451a03',
        };
    }
}

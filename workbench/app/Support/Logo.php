<?php
declare(strict_types=1);

namespace Workbench\App\Support;

final class Logo
{
    /**
     * The Lattice mark (the rounded teal grid icon) as inline SVG, for use in a
     * RawBlock. Pass utility classes to size it for each placement.
     */
    public static function mark(string $class): string
    {
        return <<<SVG
        <svg viewBox="0 0 48 48" class="{$class}" role="img" aria-label="Lattice">
          <rect width="48" height="48" rx="12" fill="#009585" />
          <g fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round">
            <path d="M16 12v24" /><path d="M24 12v24" /><path d="M32 12v24" />
            <path d="M12 16h24" /><path d="M12 24h24" /><path d="M12 32h24" />
          </g>
          <g fill="#ffffff">
            <circle cx="16" cy="16" r="2.4" /><circle cx="32" cy="16" r="2.4" /><circle cx="24" cy="24" r="2.4" /><circle cx="16" cy="32" r="2.4" /><circle cx="32" cy="32" r="2.4" />
          </g>
        </svg>
        SVG;
    }
}

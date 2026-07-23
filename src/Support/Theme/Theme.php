<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\Theme;

use Closure;
use InvalidArgumentException;
use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorKind;

/**
 * PHP port of resources/js/appearance/theme.ts, mirroring its host-var maps
 * and emission order so `toCss()` is byte-identical to the JS `createTheme()`.
 */
final class Theme
{
    private const array HOST_VAR = [
        'bg' => 'background',
        'fg' => 'foreground',
        'surface' => 'card',
        'surfaceFg' => 'card-foreground',
        'popover' => 'popover',
        'popoverFg' => 'popover-foreground',
        'primary' => 'primary',
        'primaryFg' => 'primary-foreground',
        'secondary' => 'secondary',
        'secondaryFg' => 'secondary-foreground',
        'muted' => 'muted',
        'mutedFg' => 'muted-foreground',
        'accent' => 'accent',
        'accentFg' => 'accent-foreground',
        'danger' => 'destructive',
        'dangerFg' => 'destructive-foreground',
        'success' => 'success',
        'successFg' => 'success-foreground',
        'info' => 'info',
        'infoFg' => 'info-foreground',
        'warning' => 'warning',
        'warningFg' => 'warning-foreground',
        'border' => 'border',
        'input' => 'input',
        'ring' => 'ring',
        'overlay' => 'overlay',
        'disabled' => 'disabled',
        'disabledFg' => 'disabled-foreground',
    ];

    private const array SCALAR_VAR = [
        'radius' => 'radius',
        'ringWidth' => 'ring-width',
        'ringOffset' => 'ring-offset',
        'borderWidth' => 'border-width',
        'fontSans' => 'font-sans',
        'fontMono' => 'font-mono',
        'fontDisplay' => 'font-display',
    ];

    private const array FG_PAIR = [
        'surface' => 'surfaceFg',
        'popover' => 'popoverFg',
        'primary' => 'primaryFg',
        'secondary' => 'secondaryFg',
        'muted' => 'mutedFg',
        'accent' => 'accentFg',
        'danger' => 'dangerFg',
        'success' => 'successFg',
        'info' => 'infoFg',
        'warning' => 'warningFg',
        'disabled' => 'disabledFg',
    ];

    private const array STATEFUL = ['primary', 'secondary', 'danger', 'success', 'info'];

    private const array LIGHT_COLORS = [
        'bg' => 'oklch(0.97 0 0)',
        'fg' => 'oklch(0.145 0 0)',
        'surface' => 'oklch(1 0 0)',
        'surfaceFg' => 'oklch(0.145 0 0)',
        'popover' => 'oklch(1 0 0)',
        'popoverFg' => 'oklch(0.145 0 0)',
        'primary' => 'oklch(0.48 0.092 182)',
        'primaryFg' => 'oklch(0.985 0 0)',
        'secondary' => 'oklch(0.97 0 0)',
        'secondaryFg' => 'oklch(0.205 0 0)',
        'muted' => 'oklch(0.97 0 0)',
        'mutedFg' => 'oklch(0.556 0 0)',
        'accent' => 'oklch(0.965 0.013 182)',
        'accentFg' => 'oklch(0.4 0.07 182)',
        'danger' => 'oklch(0.585 0.21 27.3)',
        'dangerFg' => 'oklch(0.985 0 0)',
        'success' => 'oklch(0.62 0.125 160)',
        'successFg' => 'oklch(0.985 0 0)',
        'info' => 'oklch(0.62 0.14 240)',
        'infoFg' => 'oklch(0.985 0 0)',
        'warning' => 'oklch(0.84 0.14 88)',
        'warningFg' => 'oklch(0.205 0 0)',
        'border' => 'oklch(0.922 0 0)',
        'input' => 'oklch(0.922 0 0)',
        'ring' => 'oklch(0.72 0.075 182)',
        'overlay' => 'oklch(0 0 0 / 0.5)',
        'disabled' => 'oklch(0.95 0 0)',
        'disabledFg' => 'oklch(0.7 0 0)',
    ];

    private const array LIGHT_STATES = [
        'primary' => ['hover' => 'oklch(0.43 0.092 182)', 'active' => 'oklch(0.39 0.092 182)'],
        'secondary' => ['hover' => 'oklch(0.93 0 0)', 'active' => 'oklch(0.9 0 0)'],
        'danger' => ['hover' => 'oklch(0.53 0.21 27.3)', 'active' => 'oklch(0.48 0.21 27.3)'],
        'success' => ['hover' => 'oklch(0.57 0.125 160)', 'active' => 'oklch(0.52 0.125 160)'],
        'info' => ['hover' => 'oklch(0.57 0.14 240)', 'active' => 'oklch(0.52 0.14 240)'],
    ];

    private const array LIGHT_SCALARS = [
        'radius' => '0.5rem',
        'ringWidth' => '3px',
        'ringOffset' => '0px',
        'borderWidth' => '1px',
        'fontSans' => '',
        'fontMono' => '',
        'fontDisplay' => '',
    ];

    private const array DARK_COLORS = [
        'bg' => 'oklch(0.145 0 0)',
        'fg' => 'oklch(0.985 0 0)',
        'surface' => 'oklch(0.145 0 0)',
        'surfaceFg' => 'oklch(0.985 0 0)',
        'popover' => 'oklch(0.145 0 0)',
        'popoverFg' => 'oklch(0.985 0 0)',
        'primary' => 'oklch(0.74 0.105 182)',
        'primaryFg' => 'oklch(0.2 0.025 182)',
        'secondary' => 'oklch(0.269 0 0)',
        'secondaryFg' => 'oklch(0.985 0 0)',
        'muted' => 'oklch(0.269 0 0)',
        'mutedFg' => 'oklch(0.708 0 0)',
        'accent' => 'oklch(0.278 0.018 182)',
        'accentFg' => 'oklch(0.985 0 0)',
        'danger' => 'oklch(0.42 0.13 26)',
        'dangerFg' => 'oklch(0.985 0 0)',
        'success' => 'oklch(0.7 0.15 162)',
        'successFg' => 'oklch(0.205 0 0)',
        'info' => 'oklch(0.7 0.14 240)',
        'infoFg' => 'oklch(0.205 0 0)',
        'warning' => 'oklch(0.7 0.13 78)',
        'warningFg' => 'oklch(0.205 0 0)',
        'border' => 'oklch(0.269 0 0)',
        'input' => 'oklch(0.269 0 0)',
        'ring' => 'oklch(0.55 0.08 182)',
        'overlay' => 'oklch(0 0 0 / 0.6)',
        'disabled' => 'oklch(0.32 0 0)',
        'disabledFg' => 'oklch(0.55 0 0)',
    ];

    private const array DARK_STATES = [
        'primary' => ['hover' => 'oklch(0.79 0.105 182)', 'active' => 'oklch(0.84 0.105 182)'],
        'secondary' => ['hover' => 'oklch(0.32 0 0)', 'active' => 'oklch(0.36 0 0)'],
        'danger' => ['hover' => 'oklch(0.47 0.13 26)', 'active' => 'oklch(0.52 0.13 26)'],
        'success' => ['hover' => 'oklch(0.75 0.15 162)', 'active' => 'oklch(0.8 0.15 162)'],
        'info' => ['hover' => 'oklch(0.75 0.14 240)', 'active' => 'oklch(0.8 0.14 240)'],
    ];

    private const array DARK_SCALARS = [
        'radius' => '0.5rem',
        'ringWidth' => '3px',
        'ringOffset' => '0px',
        'borderWidth' => '1px',
        'fontSans' => '',
        'fontMono' => '',
        'fontDisplay' => '',
    ];

    private const array LIGHT_DELTAS = ['hover' => -0.05, 'active' => -0.09];

    private const array DARK_DELTAS = ['hover' => 0.05, 'active' => 0.1];

    /** @var array<string, string> */
    private array $colors = [];

    /** @var array<string, string> */
    private array $scalars = [];

    /** @var array<string, string> */
    private array $darkColors = [];

    /** @var array<string, string> */
    private array $darkScalars = [];

    private function __construct() {}

    public static function make(): self
    {
        return new self;
    }

    /**
     * @param  array<string, mixed>  $theme
     */
    public static function fromArray(array $theme): self
    {
        $instance = self::make();

        $colors = $theme['colors'] ?? [];
        if (is_array($colors)) {
            foreach ($colors as $key => $value) {
                if (is_string($key) && array_key_exists($key, self::HOST_VAR) && is_string($value)) {
                    $instance->colors[$key] = self::guardValue($value);
                }
            }
        }

        foreach (array_keys(self::SCALAR_VAR) as $key) {
            $value = $theme[$key] ?? null;
            if (is_string($value)) {
                $instance->scalars[$key] = self::guardValue($value);
            }
        }

        if (is_array($theme['dark'] ?? null)) {
            $dark = self::fromArray($theme['dark']);
            $instance->darkColors = $dark->colors;
            $instance->darkScalars = $dark->scalars;
        }

        return $instance;
    }

    public function colors(
        Color|string|null $bg = null,
        Color|string|null $fg = null,
        Color|string|null $surface = null,
        Color|string|null $surfaceFg = null,
        Color|string|null $popover = null,
        Color|string|null $popoverFg = null,
        Color|string|null $primary = null,
        Color|string|null $primaryFg = null,
        Color|string|null $secondary = null,
        Color|string|null $secondaryFg = null,
        Color|string|null $muted = null,
        Color|string|null $mutedFg = null,
        Color|string|null $accent = null,
        Color|string|null $accentFg = null,
        Color|string|null $danger = null,
        Color|string|null $dangerFg = null,
        Color|string|null $success = null,
        Color|string|null $successFg = null,
        Color|string|null $info = null,
        Color|string|null $infoFg = null,
        Color|string|null $warning = null,
        Color|string|null $warningFg = null,
        Color|string|null $border = null,
        Color|string|null $input = null,
        Color|string|null $ring = null,
        Color|string|null $overlay = null,
        Color|string|null $disabled = null,
        Color|string|null $disabledFg = null,
    ): self {
        $overrides = get_defined_vars();
        $clone = clone $this;

        foreach ($overrides as $key => $value) {
            if ($value === null) {
                continue;
            }

            [$resolved, $darkResolved] = $this->resolveColor($value);
            $clone->colors[$key] = $resolved;

            if ($darkResolved !== null) {
                $clone->darkColors[$key] = $darkResolved;
            }
        }

        return $clone;
    }

    public function radius(string $value): self
    {
        return $this->withScalar('radius', $value);
    }

    public function ringWidth(string $value): self
    {
        return $this->withScalar('ringWidth', $value);
    }

    public function ringOffset(string $value): self
    {
        return $this->withScalar('ringOffset', $value);
    }

    public function borderWidth(string $value): self
    {
        return $this->withScalar('borderWidth', $value);
    }

    public function fontSans(string $value): self
    {
        return $this->withScalar('fontSans', $value);
    }

    public function fontMono(string $value): self
    {
        return $this->withScalar('fontMono', $value);
    }

    public function fontDisplay(string $value): self
    {
        return $this->withScalar('fontDisplay', $value);
    }

    public function dark(Closure $build): self
    {
        $built = $build(self::make());

        $clone = clone $this;
        $clone->darkColors = array_merge($clone->darkColors, $built->colors);
        $clone->darkScalars = array_merge($clone->darkScalars, $built->scalars);

        return $clone;
    }

    public function toCss(): string
    {
        $root = $this->emitMode(self::LIGHT_COLORS, self::LIGHT_STATES, self::LIGHT_SCALARS, $this->colors, $this->scalars, self::LIGHT_DELTAS);
        $dark = $this->emitMode(self::DARK_COLORS, self::DARK_STATES, self::DARK_SCALARS, $this->darkColors, $this->darkScalars, self::DARK_DELTAS);

        return ":root{{$root}}\n.dark{{$dark}}";
    }

    private function withScalar(string $key, string $value): self
    {
        $clone = clone $this;
        $clone->scalars[$key] = self::guardValue($value);

        return $clone;
    }

    /**
     * @return array{0: string, 1: string|null}
     */
    private function resolveColor(Color|string $value): array
    {
        if (! $value instanceof Color) {
            return [self::guardValue($value), null];
        }

        if ($value->kind === ColorKind::Named) {
            throw new InvalidArgumentException('A theme color cannot be defined in terms of a named token.');
        }

        return [self::guardValue($value->value), $value->dark !== null ? self::guardValue($value->dark) : null];
    }

    /**
     * Blocks CSS-breakout characters so a tenant-supplied value cannot escape
     * the assembled :root{}/.dark{} rule (e.g. `red} html{background:url(//evil)`).
     */
    private static function guardValue(string $value): string
    {
        if (preg_match('/[<>{};]/', $value) === 1) {
            throw new InvalidArgumentException(sprintf('Theme value [%s] contains invalid characters.', $value));
        }

        return $value;
    }

    /**
     * @param  array<string, string>  $baseColors
     * @param  array<string, array{hover: string, active: string}>  $baseStates
     * @param  array<string, string>  $baseScalars
     * @param  array<string, string>  $userColors
     * @param  array<string, string>  $userScalars
     * @param  array{hover: float, active: float}  $deltas
     */
    private function emitMode(
        array $baseColors,
        array $baseStates,
        array $baseScalars,
        array $userColors,
        array $userScalars,
        array $deltas,
    ): string {
        $lines = [];

        foreach (self::HOST_VAR as $key => $var) {
            if (str_ends_with($key, 'Fg')) {
                continue;
            }

            $lines[] = sprintf('--%s:%s;', $var, $userColors[$key] ?? $baseColors[$key]);
        }

        foreach (self::FG_PAIR as $baseKey => $fgKey) {
            $baseValue = $userColors[$baseKey] ?? $baseColors[$baseKey];

            if (array_key_exists($fgKey, $userColors)) {
                $fg = $userColors[$fgKey];
            } elseif (array_key_exists($baseKey, $userColors)) {
                $fg = Oklch::readableForeground(Oklch::normalizeToOklch($baseValue));
            } else {
                $fg = $baseColors[$fgKey];
            }

            $lines[] = sprintf('--%s:%s;', self::HOST_VAR[$fgKey], $fg);
        }

        foreach (self::STATEFUL as $key) {
            $baseValue = $userColors[$key] ?? $baseColors[$key];
            $overrode = array_key_exists($key, $userColors);

            if ($overrode) {
                $normalized = Oklch::normalizeToOklch($baseValue);
                $hover = Oklch::shiftLightness($normalized, $deltas['hover']);
                $active = Oklch::shiftLightness($normalized, $deltas['active']);
            } else {
                $hover = $baseStates[$key]['hover'];
                $active = $baseStates[$key]['active'];
            }

            $lines[] = sprintf('--%s-hover:%s;', self::HOST_VAR[$key], $hover);
            $lines[] = sprintf('--%s-active:%s;', self::HOST_VAR[$key], $active);
        }

        foreach (self::SCALAR_VAR as $key => $var) {
            $value = $userScalars[$key] ?? $baseScalars[$key];

            if ($value !== '') {
                $lines[] = sprintf('--%s:%s;', $var, $value);
            }
        }

        return implode('', $lines);
    }
}

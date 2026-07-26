<?php
declare(strict_types=1);

namespace Lattice\Lattice\Theme;

use Closure;
use InvalidArgumentException;
use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorKind;

/**
 * An immutable builder for the `--lt-*` design-token overrides a Lattice app
 * ships. Every colour method writes its tokens explicitly; hover and active
 * states left unset are derived from the base colour by the stylesheet, so a
 * single `primary()` call restyles the whole interactive state family.
 */
final class Theme
{
    /**
     * Every colour token the builder can write. The stylesheet must define each
     * of them in both scopes — the drift test holds the two sides together.
     */
    public const array COLOR_TOKENS = [
        '--lt-bg', '--lt-fg',
        '--lt-surface', '--lt-surface-fg',
        '--lt-popover', '--lt-popover-fg',
        '--lt-muted', '--lt-muted-fg',
        '--lt-accent', '--lt-accent-fg',
        '--lt-disabled', '--lt-disabled-fg',
        '--lt-primary', '--lt-primary-fg', '--lt-primary-hover', '--lt-primary-active',
        '--lt-secondary', '--lt-secondary-fg', '--lt-secondary-hover', '--lt-secondary-active',
        '--lt-danger', '--lt-danger-fg', '--lt-danger-hover', '--lt-danger-active',
        '--lt-success', '--lt-success-fg', '--lt-success-hover', '--lt-success-active',
        '--lt-warning', '--lt-warning-fg', '--lt-warning-hover', '--lt-warning-active',
        '--lt-info', '--lt-info-fg', '--lt-info-hover', '--lt-info-active',
        '--lt-border', '--lt-input', '--lt-ring', '--lt-overlay',
        '--lt-chart-1', '--lt-chart-2', '--lt-chart-3', '--lt-chart-4',
        '--lt-chart-5', '--lt-chart-6', '--lt-chart-7', '--lt-chart-8',
    ];

    /** @var array<string, string> */
    private array $vars = [];

    /** @var array<string, string> */
    private array $darkVars = [];

    public static function make(): self
    {
        return new self;
    }

    public function primary(
        Color|Swatch|string $color,
        Color|string|null $foreground = null,
        Color|string|null $hover = null,
        Color|string|null $active = null,
    ): self {
        return $this->interactive('primary', $color, $foreground, $hover, $active);
    }

    public function secondary(
        Color|Swatch|string $color,
        Color|string|null $foreground = null,
        Color|string|null $hover = null,
        Color|string|null $active = null,
    ): self {
        return $this->interactive('secondary', $color, $foreground, $hover, $active);
    }

    public function danger(
        Color|Swatch|string $color,
        Color|string|null $foreground = null,
        Color|string|null $hover = null,
        Color|string|null $active = null,
    ): self {
        return $this->interactive('danger', $color, $foreground, $hover, $active);
    }

    public function success(
        Color|Swatch|string $color,
        Color|string|null $foreground = null,
        Color|string|null $hover = null,
        Color|string|null $active = null,
    ): self {
        return $this->interactive('success', $color, $foreground, $hover, $active);
    }

    public function warning(
        Color|Swatch|string $color,
        Color|string|null $foreground = null,
        Color|string|null $hover = null,
        Color|string|null $active = null,
    ): self {
        return $this->interactive('warning', $color, $foreground, $hover, $active);
    }

    public function info(
        Color|Swatch|string $color,
        Color|string|null $foreground = null,
        Color|string|null $hover = null,
        Color|string|null $active = null,
    ): self {
        return $this->interactive('info', $color, $foreground, $hover, $active);
    }

    public function background(Color|string $color, Color|string|null $foreground = null): self
    {
        return $this->assign(['--lt-bg' => $color, '--lt-fg' => $foreground]);
    }

    public function surface(Color|string $color, Color|string|null $foreground = null): self
    {
        return $this->pair('surface', $color, $foreground);
    }

    public function popover(Color|string $color, Color|string|null $foreground = null): self
    {
        return $this->pair('popover', $color, $foreground);
    }

    public function muted(Color|string $color, Color|string|null $foreground = null): self
    {
        return $this->pair('muted', $color, $foreground);
    }

    public function accent(Color|string $color, Color|string|null $foreground = null): self
    {
        return $this->pair('accent', $color, $foreground);
    }

    public function disabled(Color|string $color, Color|string|null $foreground = null): self
    {
        return $this->pair('disabled', $color, $foreground);
    }

    public function border(Color|string $color): self
    {
        return $this->assign(['--lt-border' => $color]);
    }

    public function input(Color|string $color): self
    {
        return $this->assign(['--lt-input' => $color]);
    }

    public function ring(Color|string $color): self
    {
        return $this->assign(['--lt-ring' => $color]);
    }

    public function overlay(Color|string $color): self
    {
        return $this->assign(['--lt-overlay' => $color]);
    }

    /**
     * @param  list<Color|string>  $colors
     */
    public function chart(array $colors): self
    {
        if ($colors === [] || count($colors) > 8) {
            throw new InvalidArgumentException('chart() takes between 1 and 8 colours.');
        }

        $tokens = [];
        foreach ($colors as $index => $color) {
            $tokens['--lt-chart-'.($index + 1)] = $color;
        }

        return $this->assign($tokens);
    }

    public function radius(string $value): self
    {
        return $this->set('--lt-radius', $value);
    }

    public function ringWidth(string $value): self
    {
        return $this->set('--lt-ring-width', $value);
    }

    public function ringOffset(string $value): self
    {
        return $this->set('--lt-ring-offset', $value);
    }

    public function fontSans(string $value): self
    {
        return $this->set('--lt-font-sans', $value);
    }

    public function fontMono(string $value): self
    {
        return $this->set('--lt-font-mono', $value);
    }

    public function fontDisplay(string $value): self
    {
        return $this->set('--lt-font-display', $value);
    }

    public function set(string $token, string $value): self
    {
        $clone = clone $this;
        $clone->vars[$this->guard($this->normalize($token))] = $this->guard($value);

        return $clone;
    }

    /**
     * @param  Closure(self): self  $build
     */
    public function dark(Closure $build): self
    {
        $built = $build(self::make());

        if ($built->darkVars !== []) {
            throw new InvalidArgumentException(
                'The theme built inside dark() defines dark values of its own — a nested dark() or a Color dark() counterpart has nowhere to go.',
            );
        }

        $clone = clone $this;
        $clone->darkVars = [...$clone->darkVars, ...$built->vars];

        return $clone;
    }

    public function toCss(): string
    {
        return sprintf(":root{%s}\n.dark{%s}", $this->emit($this->vars), $this->emit($this->darkVars));
    }

    private function interactive(
        string $group,
        Color|Swatch|string $color,
        Color|string|null $foreground,
        Color|string|null $hover,
        Color|string|null $active,
    ): self {
        if ($color instanceof Swatch) {
            $foreground ??= $color->foreground();
            $color = $color->color();
        }

        return $this->assign([
            "--lt-{$group}" => $color,
            "--lt-{$group}-fg" => $foreground,
            "--lt-{$group}-hover" => $hover,
            "--lt-{$group}-active" => $active,
        ]);
    }

    private function pair(string $group, Color|string $color, Color|string|null $foreground): self
    {
        return $this->assign([
            "--lt-{$group}" => $color,
            "--lt-{$group}-fg" => $foreground,
        ]);
    }

    /**
     * @param  array<string, Color|string|null>  $tokens
     */
    private function assign(array $tokens): self
    {
        $clone = clone $this;

        foreach ($tokens as $token => $value) {
            if ($value === null) {
                continue;
            }

            if (! $value instanceof Color) {
                $clone->vars[$token] = $this->guard($value);

                continue;
            }

            if ($value->kind === ColorKind::Named) {
                throw new InvalidArgumentException(
                    'A named colour cannot define a theme; use Color::hex()/css() or a raw CSS string.',
                );
            }

            $clone->vars[$token] = $this->guard($value->value);

            if ($value->dark !== null) {
                $clone->darkVars[$token] = $this->guard($value->dark);
            }
        }

        return $clone;
    }

    /** @param array<string, string> $vars */
    private function emit(array $vars): string
    {
        $css = '';
        foreach ($vars as $token => $value) {
            $css .= "{$token}:{$value};";
        }

        return $css;
    }

    private function normalize(string $token): string
    {
        return str_starts_with($token, '--') ? $token : '--lt-'.$token;
    }

    private function guard(string $value): string
    {
        if (preg_match('/[<>{};]/', $value) === 1) {
            throw new InvalidArgumentException(sprintf('Theme value [%s] contains invalid characters.', $value));
        }

        return $value;
    }
}

<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\Theme;

use Closure;
use InvalidArgumentException;
use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorKind;

final class Theme
{
    /** @var array<string, string> */
    private array $vars = [];

    /** @var array<string, string> */
    private array $darkVars = [];

    /** @var array<string, string> friendly name => token */
    private const array COLOR_TOKENS = [
        'background' => '--lt-bg', 'foreground' => '--lt-fg',
        'surface' => '--lt-surface', 'surfaceForeground' => '--lt-surface-fg',
        'popover' => '--lt-popover', 'popoverForeground' => '--lt-popover-fg',
        'primary' => '--lt-primary', 'primaryForeground' => '--lt-primary-fg',
        'secondary' => '--lt-secondary', 'secondaryForeground' => '--lt-secondary-fg',
        'muted' => '--lt-muted', 'mutedForeground' => '--lt-muted-fg',
        'accent' => '--lt-accent', 'accentForeground' => '--lt-accent-fg',
        'danger' => '--lt-danger', 'dangerForeground' => '--lt-danger-fg',
        'success' => '--lt-success', 'successForeground' => '--lt-success-fg',
        'info' => '--lt-info', 'infoForeground' => '--lt-info-fg',
        'warning' => '--lt-warning', 'warningForeground' => '--lt-warning-fg',
        'border' => '--lt-border', 'input' => '--lt-input', 'ring' => '--lt-ring', 'overlay' => '--lt-overlay',
        'disabled' => '--lt-disabled', 'disabledForeground' => '--lt-disabled-fg',
    ];

    public static function make(): self
    {
        return new self;
    }

    public function colors(
        Color|string|null $background = null,
        Color|string|null $foreground = null,
        Color|string|null $surface = null,
        Color|string|null $surfaceForeground = null,
        Color|string|null $popover = null,
        Color|string|null $popoverForeground = null,
        Color|string|null $primary = null,
        Color|string|null $primaryForeground = null,
        Color|string|null $secondary = null,
        Color|string|null $secondaryForeground = null,
        Color|string|null $muted = null,
        Color|string|null $mutedForeground = null,
        Color|string|null $accent = null,
        Color|string|null $accentForeground = null,
        Color|string|null $danger = null,
        Color|string|null $dangerForeground = null,
        Color|string|null $success = null,
        Color|string|null $successForeground = null,
        Color|string|null $info = null,
        Color|string|null $infoForeground = null,
        Color|string|null $warning = null,
        Color|string|null $warningForeground = null,
        Color|string|null $border = null,
        Color|string|null $input = null,
        Color|string|null $ring = null,
        Color|string|null $overlay = null,
        Color|string|null $disabled = null,
        Color|string|null $disabledForeground = null,
    ): self {
        /** @var array<string, Color|string|null> $arguments */
        $arguments = get_defined_vars();

        $clone = clone $this;
        foreach ($arguments as $name => $value) {
            if ($value !== null) {
                $clone->vars[self::COLOR_TOKENS[$name]] = $this->guard($this->stringValue($value));
            }
        }

        return $clone;
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

    public function dark(Closure $build): self
    {
        $built = $build(self::make());
        $clone = clone $this;
        $clone->darkVars = [...$clone->darkVars, ...$built->vars];

        return $clone;
    }

    public function toCss(): string
    {
        return sprintf(":root{%s}\n.dark{%s}", $this->emit($this->vars), $this->emit($this->darkVars));
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

    private function stringValue(Color|string $value): string
    {
        if (! $value instanceof Color) {
            return $value;
        }

        if ($value->kind === ColorKind::Named) {
            throw new InvalidArgumentException('A named colour cannot define a theme; use Color::hex()/css() or a raw CSS string.');
        }

        if ($value->dark !== null) {
            throw new InvalidArgumentException("A colour's dark() counterpart is not used in a theme; set dark values via Theme::dark().");
        }

        return $value->value;
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

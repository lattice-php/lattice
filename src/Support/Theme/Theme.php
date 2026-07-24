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

    /** @var array<string, string> friendly name => host-var token */
    private const COLOR_TOKENS = [
        'background' => '--background', 'foreground' => '--foreground',
        'card' => '--card', 'cardForeground' => '--card-foreground',
        'popover' => '--popover', 'popoverForeground' => '--popover-foreground',
        'primary' => '--primary', 'primaryForeground' => '--primary-foreground',
        'secondary' => '--secondary', 'secondaryForeground' => '--secondary-foreground',
        'muted' => '--muted', 'mutedForeground' => '--muted-foreground',
        'accent' => '--accent', 'accentForeground' => '--accent-foreground',
        'danger' => '--destructive', 'dangerForeground' => '--destructive-foreground',
        'success' => '--success', 'successForeground' => '--success-foreground',
        'info' => '--info', 'infoForeground' => '--info-foreground',
        'warning' => '--warning', 'warningForeground' => '--warning-foreground',
        'border' => '--border', 'input' => '--input', 'ring' => '--ring', 'overlay' => '--overlay',
    ];

    /** @var array<string, string> */
    private const SCALAR_TOKENS = [
        'radius' => '--radius', 'ringWidth' => '--ring-width', 'ringOffset' => '--ring-offset',
        'borderWidth' => '--border-width', 'fontSans' => '--font-sans',
        'fontMono' => '--font-mono', 'fontDisplay' => '--font-display',
    ];

    public static function make(): self
    {
        return new self;
    }

    public function colors(
        Color|string|null $background = null,
        Color|string|null $foreground = null,
        Color|string|null $card = null,
        Color|string|null $cardForeground = null,
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
    ): self {
        $clone = clone $this;
        $values = [
            '--background' => $background, '--foreground' => $foreground,
            '--card' => $card, '--card-foreground' => $cardForeground,
            '--popover' => $popover, '--popover-foreground' => $popoverForeground,
            '--primary' => $primary, '--primary-foreground' => $primaryForeground,
            '--secondary' => $secondary, '--secondary-foreground' => $secondaryForeground,
            '--muted' => $muted, '--muted-foreground' => $mutedForeground,
            '--accent' => $accent, '--accent-foreground' => $accentForeground,
            '--destructive' => $danger, '--destructive-foreground' => $dangerForeground,
            '--success' => $success, '--success-foreground' => $successForeground,
            '--info' => $info, '--info-foreground' => $infoForeground,
            '--warning' => $warning, '--warning-foreground' => $warningForeground,
            '--border' => $border, '--input' => $input, '--ring' => $ring, '--overlay' => $overlay,
        ];
        foreach ($values as $token => $value) {
            if ($value !== null) {
                $clone->vars[$token] = self::guard(self::stringValue($value));
            }
        }

        return $clone;
    }

    public function radius(string $value): self
    {
        return $this->set('--radius', $value);
    }

    public function ringWidth(string $value): self
    {
        return $this->set('--ring-width', $value);
    }

    public function ringOffset(string $value): self
    {
        return $this->set('--ring-offset', $value);
    }

    public function borderWidth(string $value): self
    {
        return $this->set('--border-width', $value);
    }

    public function fontSans(string $value): self
    {
        return $this->set('--font-sans', $value);
    }

    public function fontMono(string $value): self
    {
        return $this->set('--font-mono', $value);
    }

    public function fontDisplay(string $value): self
    {
        return $this->set('--font-display', $value);
    }

    public function set(string $token, string $value): self
    {
        $clone = clone $this;
        $clone->vars[self::normalize($token)] = self::guard($value);

        return $clone;
    }

    public function dark(Closure $build): self
    {
        $built = $build(self::make());
        $clone = clone $this;
        $clone->darkVars = [...$clone->darkVars, ...$built->vars];

        return $clone;
    }

    /** @param array<string, mixed> $theme */
    public static function fromArray(array $theme): self
    {
        $instance = self::make();

        $colors = $theme['colors'] ?? [];
        if (is_array($colors)) {
            foreach ($colors as $name => $value) {
                if (isset(self::COLOR_TOKENS[$name]) && is_string($value)) {
                    $instance = $instance->set(self::COLOR_TOKENS[$name], $value);
                }
            }
        }

        foreach (self::SCALAR_TOKENS as $name => $token) {
            $value = $theme[$name] ?? null;
            if (is_string($value)) {
                $instance = $instance->set($token, $value);
            }
        }

        $dark = $theme['dark'] ?? null;
        if (is_array($dark)) {
            $built = self::fromArray($dark);
            $instance = clone $instance;
            $instance->darkVars = [...$instance->darkVars, ...$built->vars];
        }

        return $instance;
    }

    public function toCss(): string
    {
        return sprintf(":root{%s}\n.dark{%s}", self::emit($this->vars), self::emit($this->darkVars));
    }

    /** @param array<string, string> $vars */
    private static function emit(array $vars): string
    {
        $css = '';
        foreach ($vars as $token => $value) {
            $css .= "{$token}:{$value};";
        }

        return $css;
    }

    private static function stringValue(Color|string $value): string
    {
        if (! $value instanceof Color) {
            return $value;
        }

        if ($value->kind === ColorKind::Named) {
            throw new InvalidArgumentException('A named colour cannot define a theme; use Color::hex()/css() or a raw CSS string.');
        }

        return $value->value;
    }

    private static function normalize(string $token): string
    {
        return str_starts_with($token, '--') ? $token : '--'.$token;
    }

    private static function guard(string $value): string
    {
        if (preg_match('/[<>{};]/', $value) === 1) {
            throw new InvalidArgumentException(sprintf('Theme value [%s] contains invalid characters.', $value));
        }

        return $value;
    }
}

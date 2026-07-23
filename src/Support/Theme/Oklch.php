<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\Theme;

/**
 * PHP port of resources/js/appearance/oklch.ts, faithfully mirroring its
 * rounding and cbrt behavior so the two implementations are byte-identical.
 */
final class Oklch
{
    private const string LIGHT_FG = 'oklch(0.985 0 0)';

    private const string DARK_FG = 'oklch(0.205 0 0)';

    private const string OKLCH_PATTERN = '/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)$/';

    /**
     * @return array{l: float, c: float, h: float, alpha: float|null}|null
     */
    public static function parseOklch(string $value): ?array
    {
        if (preg_match(self::OKLCH_PATTERN, trim($value), $matches) !== 1) {
            return null;
        }

        return [
            'l' => (float) $matches[1],
            'c' => (float) $matches[2],
            'h' => (float) $matches[3],
            'alpha' => isset($matches[4]) ? (float) $matches[4] : null,
        ];
    }

    public static function shiftLightness(string $value, float $delta): string
    {
        $parsed = self::parseOklch($value);
        if ($parsed === null) {
            return $value;
        }

        $parsed['l'] = min(1, max(0, $parsed['l'] + $delta));

        return self::format($parsed);
    }

    public static function readableForeground(string $value): string
    {
        $parsed = self::parseOklch($value);
        if ($parsed === null) {
            return self::LIGHT_FG;
        }

        return $parsed['l'] >= 0.6 ? self::DARK_FG : self::LIGHT_FG;
    }

    public static function normalizeToOklch(string $value): string
    {
        if (self::parseOklch($value) !== null) {
            return $value;
        }

        $channels = self::parseRgbChannels($value);
        if ($channels === null) {
            return $value;
        }

        [$r, $g, $b] = array_map(self::linearize(...), $channels);

        $l = 0.4122214708 * $r + 0.5363325363 * $g + 0.0514459929 * $b;
        $m = 0.2119034982 * $r + 0.6806995451 * $g + 0.1073969566 * $b;
        $s = 0.0883024619 * $r + 0.2817188376 * $g + 0.6299787005 * $b;

        $l_ = self::cbrt($l);
        $m_ = self::cbrt($m);
        $s_ = self::cbrt($s);

        $L = 0.2104542553 * $l_ + 0.793617785 * $m_ - 0.0040720468 * $s_;
        $A = 1.9779984951 * $l_ - 2.428592205 * $m_ + 0.4505937099 * $s_;
        $B = 0.0259040371 * $l_ + 0.7827717662 * $m_ - 0.808675766 * $s_;

        $C = self::round(sqrt($A * $A + $B * $B));
        $H = atan2($B, $A) * 180 / M_PI;
        if ($H < 0) {
            $H += 360;
        }

        $hue = $C === 0.0 ? 0.0 : self::round($H);

        return sprintf('oklch(%s %s %s)', self::stringify(self::round($L)), self::stringify($C), self::stringify($hue));
    }

    /**
     * @param  array{l: float, c: float, h: float, alpha: float|null}  $parsed
     */
    private static function format(array $parsed): string
    {
        $base = sprintf('oklch(%s %s %s', self::stringify(self::round($parsed['l'])), self::stringify(self::round($parsed['c'])), self::stringify(self::round($parsed['h'])));

        return $parsed['alpha'] === null ? "{$base})" : sprintf('%s / %s)', $base, self::stringify(self::round($parsed['alpha'])));
    }

    private static function round(float $value): float
    {
        return round($value, 3);
    }

    private static function stringify(float $value): string
    {
        return (string) $value;
    }

    private static function cbrt(float $x): float
    {
        return $x < 0 ? -((-$x) ** (1 / 3)) : $x ** (1 / 3);
    }

    /**
     * @return array{0: float, 1: float, 2: float}|null
     */
    private static function parseRgbChannels(string $value): ?array
    {
        $hex = preg_replace('/^#/', '', trim($value)) ?? '';

        if (preg_match('/^[0-9a-fA-F]{3,4}$/', $hex) === 1) {
            $r = $hex[0];
            $g = $hex[1];
            $b = $hex[2];

            return [(float) hexdec($r.$r), (float) hexdec($g.$g), (float) hexdec($b.$b)];
        }

        if (preg_match('/^[0-9a-fA-F]{6}$/', $hex) === 1 || preg_match('/^[0-9a-fA-F]{8}$/', $hex) === 1) {
            return [
                (float) hexdec(substr($hex, 0, 2)),
                (float) hexdec(substr($hex, 2, 2)),
                (float) hexdec(substr($hex, 4, 2)),
            ];
        }

        if (preg_match('/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/', $value, $matches) === 1) {
            return [(float) $matches[1], (float) $matches[2], (float) $matches[3]];
        }

        return null;
    }

    private static function linearize(float $c): float
    {
        $s = $c / 255;

        return $s <= 0.04045 ? $s / 12.92 : (($s + 0.055) / 1.055) ** 2.4;
    }
}

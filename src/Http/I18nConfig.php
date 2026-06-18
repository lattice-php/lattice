<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final readonly class I18nConfig implements JsonSerializable
{
    /**
     * @param  array<int, string>  $locales
     * @param  array<int, string>  $preloadLocales
     */
    public function __construct(
        public bool $enabled,
        public bool $saveMissing,
        public array $locales,
        public array $preloadLocales,
        public ?string $timezone = null,
    ) {}

    /**
     * @param  array<int, string>|null  $locales
     */
    public static function fromConfig(?array $locales = null, ?string $timezone = null): self
    {
        return new self(
            enabled: (bool) config('i18next.routes.enabled', false),
            saveMissing: (bool) config('i18next.save_missing.enabled', false),
            locales: $locales ?? self::configuredList('lattice.i18n.locales'),
            preloadLocales: self::configuredList('lattice.i18n.preload_locales'),
            timezone: $timezone,
        );
    }

    /**
     * @return array{enabled: bool, saveMissing: bool, locales: array<int, string>, preloadLocales: array<int, string>, timezone: string|null}
     */
    public function jsonSerialize(): array
    {
        return [
            'enabled' => $this->enabled,
            'saveMissing' => $this->saveMissing,
            'locales' => $this->locales,
            'preloadLocales' => $this->preloadLocales,
            'timezone' => $this->timezone,
        ];
    }

    /**
     * @return array<int, string>
     */
    private static function configuredList(string $key): array
    {
        $configured = config($key, []);

        if (is_string($configured)) {
            $configured = [$configured];
        }

        if (! is_array($configured)) {
            return [];
        }

        return array_values(array_filter($configured, fn (mixed $locale): bool => is_string($locale) && $locale !== ''));
    }
}

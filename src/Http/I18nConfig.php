<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;

/**
 * The i18n signals the backend shares to the renderer, mirrored from
 * laravel-i18next's config so it stays the single source of truth. The frontend
 * hardcodes the routes, so only these travel: whether translations are served
 * and whether missing keys are reported back.
 */
#[TypeScript]
final readonly class I18nConfig implements JsonSerializable
{
    public function __construct(
        public bool $enabled,
        public bool $saveMissing,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            enabled: (bool) config('i18next.routes.enabled', false),
            saveMissing: (bool) config('i18next.save_missing.enabled', false),
        );
    }

    /**
     * @return array{enabled: bool, saveMissing: bool}
     */
    public function jsonSerialize(): array
    {
        return [
            'enabled' => $this->enabled,
            'saveMissing' => $this->saveMissing,
        ];
    }
}

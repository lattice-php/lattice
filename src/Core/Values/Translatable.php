<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Values;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;

/**
 * A deferred, client-resolved translation: an i18next key plus replacements
 * that are filled on the client — some from the live event payload (by dotted
 * path), some static. Resolved via i18next `t()` at dispatch time, so it
 * interpolates payload data and re-localizes on locale change.
 */
#[TypeScript]
final class Translatable implements JsonSerializable
{
    /** @var array<string, string> */
    public array $payload = [];

    /** @var array<string, string|int|float|bool> */
    public array $replacements = [];

    private function __construct(public string $key) {}

    public static function make(string $key): self
    {
        return new self($key);
    }

    /**
     * @param  array<string, string>  $paths  replacement name => dotted payload path
     */
    public function fromPayload(array $paths): self
    {
        $this->payload = [...$this->payload, ...$paths];

        return $this;
    }

    /**
     * @param  array<string, string|int|float|bool>  $replacements
     */
    public function with(array $replacements): self
    {
        $this->replacements = [...$this->replacements, ...$replacements];

        return $this;
    }

    /**
     * @return array{key: string, payload: array<string, string>, replacements: array<string, string|int|float|bool>}
     */
    public function jsonSerialize(): array
    {
        return [
            'key' => $this->key,
            'payload' => $this->payload,
            'replacements' => $this->replacements,
        ];
    }
}

<?php
declare(strict_types=1);

namespace Lattice\I18n\Values;

use DateTimeInterface;
use JsonSerializable;
use Lattice\Core\Attributes\TypeScript;
use Lattice\Core\Support\Wire;
use stdClass;

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

    /**
     * Only guaranteed scalar (no `DateTimeInterface`) when built through
     * {@see with()} — direct assignment or {@see fromWire()} bypasses that.
     *
     * @var array<string, string|int|float|bool>
     */
    public array $replacements = [];

    private function __construct(public string $key) {}

    public static function make(string $key): self
    {
        return new self($key);
    }

    /**
     * Rehydrate a value that may be a serialized wire shape, e.g. an untyped
     * database notification payload. Returns null for anything that does not
     * look like one.
     */
    public static function tryFromWire(mixed $value): ?self
    {
        if (! is_array($value) || ! is_string($value['key'] ?? null)) {
            return null;
        }

        return self::fromWire($value);
    }

    /**
     * Rehydrate a Translatable from its serialized wire shape, e.g. when it
     * comes back out of a database notification's stored payload.
     *
     * @param  array<string, mixed>  $wire
     */
    public static function fromWire(array $wire): self
    {
        $translatable = new self((string) $wire['key']);
        $translatable->payload = (array) ($wire['payload'] ?? []);
        $translatable->replacements = (array) ($wire['replacements'] ?? []);

        return $translatable;
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
     * Wire stays flat scalars so a date is formatted client-side, in the
     * reader's locale, instead of being fixed into English prose here.
     *
     * @param  array<string, string|int|float|bool|DateTimeInterface>  $replacements
     */
    public function with(array $replacements): self
    {
        $this->replacements = [
            ...$this->replacements,
            ...array_map(
                static fn (mixed $value): mixed => $value instanceof DateTimeInterface
                    ? $value->format(DateTimeInterface::ATOM)
                    : $value,
                $replacements,
            ),
        ];

        return $this;
    }

    /**
     * @return array{key: string, payload: array<string, string>|stdClass, replacements: array<string, string|int|float|bool>|stdClass}
     */
    public function jsonSerialize(): array
    {
        return [
            'key' => $this->key,
            'payload' => Wire::map($this->payload),
            'replacements' => Wire::map($this->replacements),
        ];
    }
}

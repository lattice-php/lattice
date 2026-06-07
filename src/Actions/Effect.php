<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use JsonSerializable;

final readonly class Effect implements JsonSerializable
{
    /**
     * @param  array<string, mixed>  $payload
     */
    private function __construct(
        private string $type,
        private array $payload = [],
    ) {}

    public static function toast(string $message): self
    {
        return new self('toast', ['message' => $message]);
    }

    public static function reloadComponent(string $component): self
    {
        return new self('reloadComponent', ['component' => $component]);
    }

    public static function openModal(string $modal): self
    {
        return new self('openModal', ['modal' => $modal]);
    }

    public static function closeModal(?string $modal = null): self
    {
        return new self('closeModal', array_filter([
            'modal' => $modal,
        ], fn (mixed $value): bool => $value !== null));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'type' => $this->type,
            ...$this->payload,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}

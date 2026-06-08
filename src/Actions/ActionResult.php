<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Enums\ToastType;
use Bambamboole\Lattice\Toasts\ToastMessage;
use JsonSerializable;

final readonly class ActionResult implements JsonSerializable
{
    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, Effect>  $effects
     */
    private function __construct(
        private bool $ok,
        private array $data = [],
        private array $effects = [],
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function success(array $data = []): self
    {
        return new self(true, $data);
    }

    public function effect(Effect $effect): self
    {
        return new self($this->ok, $this->data, [
            ...$this->effects,
            $effect,
        ]);
    }

    public function toast(string|ToastMessage|ToastType $message, ToastType|string|null $type = null): self
    {
        return $this->effect(Effect::toast($message, $type));
    }

    public function reloadComponent(string $component): self
    {
        return $this->effect(Effect::reloadComponent($component));
    }

    public function openModal(string $modal): self
    {
        return $this->effect(Effect::openModal($modal));
    }

    public function closeModal(?string $modal = null): self
    {
        return $this->effect(Effect::closeModal($modal));
    }

    /**
     * @return array{ok: bool, data: array<string, mixed>, effects: array<int, array<string, mixed>>}
     */
    public function toArray(): array
    {
        return [
            'ok' => $this->ok,
            'data' => $this->data,
            'effects' => array_map(
                fn (Effect $effect): array => $effect->toArray(),
                $this->effects,
            ),
        ];
    }

    /**
     * @return array{ok: bool, data: array<string, mixed>, effects: array<int, array<string, mixed>>}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}

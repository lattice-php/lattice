<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Actions\Contracts\Effect as EffectContract;
use Bambamboole\Lattice\Core\Enums\ToastType;
use Bambamboole\Lattice\Core\Values\ToastMessage;
use JsonSerializable;

final readonly class ActionResult implements JsonSerializable
{
    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, EffectContract>  $effects
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

    public function effect(EffectContract $effect): self
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

    public function reloadPage(): self
    {
        return $this->effect(Effect::reloadPage());
    }

    public function redirect(string $url): self
    {
        return $this->effect(Effect::redirect($url));
    }

    public function download(string $url): self
    {
        return $this->effect(Effect::download($url));
    }

    public function openModal(string $modal): self
    {
        return $this->effect(Effect::openModal($modal));
    }

    public function closeModal(?string $modal = null): self
    {
        return $this->effect(Effect::closeModal($modal));
    }

    public function resetForm(?string $form = null): self
    {
        return $this->effect(Effect::resetForm($form));
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
                fn (EffectContract $effect): array => $effect->toArray(),
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

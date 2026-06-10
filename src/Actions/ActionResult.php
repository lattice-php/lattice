<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use JsonSerializable;
use Lattice\Lattice\Actions\Contracts\Effect as EffectContract;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Lattice\Lattice\Core\Values\ToastMessage;

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

    /**
     * @param  array<string, mixed>  $data
     */
    public static function failure(array $data = []): self
    {
        return new self(false, $data);
    }

    public function effect(EffectContract $effect): self
    {
        return new self($this->ok, $this->data, [
            ...$this->effects,
            $effect,
        ]);
    }

    public function toast(string|ToastMessage|ToastVariant $message, ToastVariant|string|null $variant = null): self
    {
        return $this->effect(Effect::toast($message, $variant));
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
     * @return array{ok: bool, data: array<string, mixed>, effects: array<int, EffectContract>}
     */
    public function jsonSerialize(): array
    {
        return [
            'ok' => $this->ok,
            'data' => $this->data,
            'effects' => $this->effects,
        ];
    }
}

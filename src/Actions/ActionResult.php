<?php
declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Variant;
use Lattice\Lattice\Core\Values\Callout;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Effects\Effect;

#[TypeScript]
final readonly class ActionResult implements JsonSerializable
{
    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, EffectContract>  $effects
     */
    private function __construct(
        public bool $ok,
        public array $data = [],
        public array $effects = [],
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

    public function callout(Callout $callout): self
    {
        return $this->effect(Effect::callout($callout));
    }

    public function toast(string|ToastMessage|Variant $message, Variant|string|null $variant = null): self
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

    public function localeChange(string $locale): self
    {
        return $this->effect(Effect::localeChange($locale));
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

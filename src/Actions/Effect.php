<?php

declare(strict_types=1);

namespace Lattice\Lattice\Actions;

use Lattice\Lattice\Actions\Contracts\Effect as EffectContract;
use Lattice\Lattice\Actions\Enums\EffectType;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Lattice\Lattice\Core\Values\ToastMessage;

final readonly class Effect implements EffectContract
{
    /**
     * @param  array<string, mixed>  $payload
     */
    private function __construct(
        private EffectType $type,
        private array $payload = [],
    ) {}

    public static function toast(string|ToastMessage|ToastVariant $message, ToastVariant|string|null $variant = null): self
    {
        $toast = match (true) {
            $message instanceof ToastMessage => $message,
            $message instanceof ToastVariant && is_string($variant) => ToastMessage::make($message, $variant),
            is_string($message) && $variant instanceof ToastVariant => ToastMessage::make($variant, $message),
            is_string($message) => ToastMessage::make(ToastVariant::Success, $message),
            default => throw new \InvalidArgumentException('A toast message string is required.'),
        };

        return new self(EffectType::Toast, $toast->jsonSerialize());
    }

    public static function reloadComponent(string $component): self
    {
        return new self(EffectType::ReloadComponent, ['component' => $component]);
    }

    public static function reloadPage(): self
    {
        return new self(EffectType::ReloadPage);
    }

    public static function redirect(string $url): self
    {
        return new self(EffectType::Redirect, ['url' => $url]);
    }

    public static function download(string $url): self
    {
        return new self(EffectType::Download, ['url' => $url]);
    }

    public static function openModal(string $modal): self
    {
        return new self(EffectType::OpenModal, ['modal' => $modal]);
    }

    public static function closeModal(?string $modal = null): self
    {
        return new self(EffectType::CloseModal, array_filter([
            'modal' => $modal,
        ], fn (mixed $value): bool => $value !== null));
    }

    public static function resetForm(?string $form = null): self
    {
        return new self(EffectType::ResetForm, array_filter([
            'form' => $form,
        ], fn (mixed $value): bool => $value !== null));
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type->value,
            ...$this->payload,
        ];
    }
}

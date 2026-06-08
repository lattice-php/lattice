<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Actions;

use Bambamboole\Lattice\Enums\ToastType;
use Bambamboole\Lattice\Toasts\ToastMessage;
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

    public static function toast(string|ToastMessage|ToastType $message, ToastType|string|null $type = null): self
    {
        $toast = match (true) {
            $message instanceof ToastMessage => $message,
            $message instanceof ToastType && is_string($type) => ToastMessage::make($message, $type),
            is_string($message) && $type instanceof ToastType => ToastMessage::make($type, $message),
            is_string($message) => ToastMessage::make(ToastType::Success, $message),
            default => throw new \InvalidArgumentException('A toast message string is required.'),
        };

        return new self('toast', $toast->toEffectPayload());
    }

    public static function reloadComponent(string $component): self
    {
        return new self('reloadComponent', ['component' => $component]);
    }

    public static function reloadPage(): self
    {
        return new self('reloadPage');
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

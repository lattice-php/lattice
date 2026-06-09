<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Core\Toasts;

use Bambamboole\Lattice\Core\Toasts\Enums\ToastType;
use JsonSerializable;

final readonly class ToastMessage implements JsonSerializable
{
    private function __construct(
        public ToastType $type,
        public string $message,
    ) {}

    public static function make(ToastType $type, string $message): self
    {
        return new self($type, $message);
    }

    /**
     * @return array{type: string, message: string}
     */
    public function toArray(): array
    {
        return [
            'type' => $this->type->value,
            'message' => $this->message,
        ];
    }

    /**
     * @return array{variant: string, message: string}
     */
    public function toEffectPayload(): array
    {
        return [
            'variant' => $this->type->value,
            'message' => $this->message,
        ];
    }

    /**
     * @return array{type: string, message: string}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}

<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Values;

use JsonSerializable;
use Lattice\Lattice\Core\Enums\ToastVariant;

final readonly class ToastMessage implements JsonSerializable
{
    private function __construct(
        public ToastVariant $variant,
        public string $message,
    ) {}

    public static function make(ToastVariant $variant, string $message): self
    {
        return new self($variant, $message);
    }

    /**
     * @return array{variant: string, message: string}
     */
    public function toArray(): array
    {
        return [
            'variant' => $this->variant->value,
            'message' => $this->message,
        ];
    }

    /**
     * @return array{variant: string, message: string}
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}

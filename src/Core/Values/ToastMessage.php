<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Values;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Concerns\HasAction;
use Lattice\Lattice\Core\Concerns\HasDismissible;
use Lattice\Lattice\Core\Enums\Variant;

/**
 * Builder for a toast notification: a message and variant plus optional lifetime,
 * a close button, and an action rendered in the toast (a link or a full Action
 * that can open a confirm dialog or modal form).
 */
#[TypeScript]
final class ToastMessage implements JsonSerializable
{
    use HasAction;
    use HasDismissible;

    public ?int $duration = null;

    public bool $persistent = false;

    private function __construct(
        public Variant $variant,
        public string $message,
    ) {}

    public static function make(Variant $variant, string $message): self
    {
        return new self($variant, $message);
    }

    public function duration(int $milliseconds): self
    {
        $this->duration = $milliseconds;

        return $this;
    }

    public function persistent(bool $persistent = true): self
    {
        $this->persistent = $persistent;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return [
            'variant' => $this->variant->value,
            'message' => $this->message,
            'duration' => $this->duration,
            'persistent' => $this->persistent,
            'dismissible' => $this->dismissible,
            'action' => $this->action,
        ];
    }
}

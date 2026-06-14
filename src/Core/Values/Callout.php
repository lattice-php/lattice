<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Values;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Concerns\HasAction;
use Lattice\Lattice\Core\Concerns\HasDismissible;
use Lattice\Lattice\Core\Enums\Variant;

/**
 * Builder for a callout: a prominent, persistent banner rendered in a layout's
 * Callouts slot. A heading plus body and variant, with an optional dismiss
 * button and an action (a link or a full Action).
 */
#[TypeScript]
final class Callout implements JsonSerializable
{
    use HasAction;
    use HasDismissible;

    public ?string $title = null;

    private function __construct(
        public Variant $variant,
        public string $message,
    ) {}

    public static function make(Variant $variant, string $message): self
    {
        return new self($variant, $message);
    }

    public function title(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return [
            'variant' => $this->variant->value,
            'title' => $this->title,
            'message' => $this->message,
            'dismissible' => $this->dismissible,
            'action' => $this->action,
        ];
    }
}

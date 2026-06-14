<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Values;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Variant;

/**
 * Builder for a callout: a prominent, persistent banner rendered in a layout's
 * Callouts slot. A heading plus body and variant, with an optional dismiss
 * button and an action (a link or a full Action).
 */
#[TypeScript]
final class Callout implements JsonSerializable
{
    public ?string $title = null;

    public bool $dismissible = true;

    public ?Component $action = null;

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

    public function dismissible(bool $dismissible = true): self
    {
        $this->dismissible = $dismissible;

        return $this;
    }

    public function link(string $label, string $href, HttpMethod $method = HttpMethod::Get): self
    {
        return $this->action(Link::make($label)->href($href)->method($method));
    }

    public function action(Component $action): self
    {
        $this->action = $action;

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

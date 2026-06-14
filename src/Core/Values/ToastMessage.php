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
 * Builder for a toast notification: a message and variant plus optional lifetime,
 * a close button, and an action rendered in the toast (a link or a full Action
 * that can open a confirm dialog or modal form).
 */
#[TypeScript]
final class ToastMessage implements JsonSerializable
{
    public ?int $duration = null;

    public bool $persistent = false;

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
            'message' => $this->message,
            'duration' => $this->duration,
            'persistent' => $this->persistent,
            'dismissible' => $this->dismissible,
            'action' => $this->action,
        ];
    }
}

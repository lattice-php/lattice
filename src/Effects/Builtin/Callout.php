<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\Link;
use Lattice\Lattice\Ui\Enums\Variant;

/**
 * A callout: a prominent, persistent banner rendered in a layout's Callouts
 * slot. A heading plus body and variant, with an optional dismiss button and
 * an action (a link or a full Action).
 */
#[AsEffect('callout')]
final class Callout extends Effect
{
    private function __construct(
        public Variant $variant,
        public string $message,
        public ?string $title = null,
        public bool $dismissible = true,
        public ?Component $action = null,
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
}

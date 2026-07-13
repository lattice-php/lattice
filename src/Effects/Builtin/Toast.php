<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\Link;
use Lattice\Lattice\Ui\Enums\Variant;

/**
 * A toast notification: a message and variant plus optional lifetime, a close
 * button, and an action rendered in the toast (a link or a full Action that
 * can open a confirm dialog or modal form).
 */
#[AsEffect('toast')]
final class Toast extends Effect
{
    private function __construct(
        public Variant $variant,
        public string|Translatable $message,
        public ?int $duration = null,
        public bool $persistent = false,
        public bool $dismissible = true,
        public ?Component $action = null,
    ) {}

    public static function make(Variant $variant, string|Translatable $message): self
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
}

<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Builtin;

use Lattice\Lattice\Effects\Attributes\AsEffect;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\Link;
use Lattice\Lattice\Ui\Enums\HttpMethod;
use Lattice\Lattice\Ui\Enums\Variant;

/**
 * A callout: a prominent, persistent banner rendered in a layout's Callouts
 * slot. A heading plus body and variant, with an optional dismiss button and
 * an action (a link or a full Action).
 *
 * Without a unique key a callout is an event: emitted once, it stays until the
 * user dismisses it. With one it is a projection of server state — the client
 * replaces any callout sharing the key and drops it on a URL-changing
 * navigation unless the server asserts it again (a same-URL reload, back(),
 * or poll does not retract it; browser back/forward always drops it), so a
 * keyed callout must be re-emitted on every request for which it still holds.
 */
#[AsEffect('callout')]
final class Callout extends Effect
{
    private function __construct(
        public Variant $variant,
        public string|Translatable $message,
        public string|Translatable|null $title = null,
        public bool $dismissible = true,
        public ?Component $action = null,
        public ?string $unique = null,
    ) {}

    public static function make(string|Translatable $message, Variant $variant = Variant::Info): self
    {
        return new self($variant, $message);
    }

    public function title(string|Translatable $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function dismissible(bool $dismissible = true): self
    {
        $this->dismissible = $dismissible;

        return $this;
    }

    public function unique(string $key): self
    {
        $this->unique = $key;

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
     * States that the keyed callout `$key` no longer applies. Pair it with
     * the asserting `Callout`: `Effects::flash($callout ?? Callout::retract('billing.state'))`.
     */
    public static function retract(string $key): RetractCallout
    {
        return new RetractCallout($key);
    }
}

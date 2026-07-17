<?php
declare(strict_types=1);

namespace Lattice\Lattice\Realtime;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Effects\Builtin\Callout;
use Lattice\Lattice\Effects\Builtin\Toast;
use Lattice\Lattice\Effects\Effect;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Realtime\Enums\ChannelVisibility;
use Lattice\Lattice\Ui\Enums\Variant;

/**
 * Declares a websocket listener for a page: a channel, the broadcast event
 * name(s) to react to, and the effects to dispatch on the client when one
 * arrives. Effects are limited to the broadcast-safe subset.
 */
#[TypeScript]
final class Listen
{
    /**
     * @param  list<string>  $events
     * @param  list<Effect>  $effects
     */
    private function __construct(
        public readonly string $channel,
        public readonly ChannelVisibility $visibility,
        public array $events = [],
        public array $effects = [],
    ) {}

    public static function channel(string $name): self
    {
        return new self($name, ChannelVisibility::Public);
    }

    public static function private(string $name): self
    {
        return new self($name, ChannelVisibility::Private);
    }

    public static function presence(string $name): self
    {
        return new self($name, ChannelVisibility::Presence);
    }

    /**
     * @param  string|list<string>  $events
     */
    public function on(string|array $events): self
    {
        $this->events = array_values(array_unique([...$this->events, ...(array) $events]));

        return $this;
    }

    public function toast(string|Translatable|Toast $message, Variant $variant = Variant::Success): self
    {
        $this->effects[] = Effects::toast($message, $variant);

        return $this;
    }

    public function callout(Callout $callout): self
    {
        $this->effects[] = $callout;

        return $this;
    }

    public function reloadPage(): self
    {
        $this->effects[] = Effects::reloadPage();

        return $this;
    }
}

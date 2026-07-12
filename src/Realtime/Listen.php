<?php
declare(strict_types=1);

namespace Lattice\Lattice\Realtime;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Facades\Effects;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Realtime\Enums\ChannelVisibility;
use Lattice\Lattice\Ui\Enums\Variant;
use Lattice\Lattice\Ui\Values\Callout;
use Lattice\Lattice\Ui\Values\ToastMessage;

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
     * @param  list<EffectContract>  $effects
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

    public function toast(string|Translatable|ToastMessage|Variant $message, Variant|string|null $variant = null): self
    {
        $this->effects[] = Effects::toast($message, $variant);

        return $this;
    }

    public function callout(Callout $callout): self
    {
        $this->effects[] = Effects::callout($callout);

        return $this;
    }

    public function reloadPage(): self
    {
        $this->effects[] = Effects::reloadPage();

        return $this;
    }
}

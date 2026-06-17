<?php
declare(strict_types=1);

namespace Lattice\Lattice\Realtime;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Realtime\Enums\ChannelVisibility;

#[TypeScript]
final readonly class ListenerPayload implements JsonSerializable
{
    /**
     * @param  list<string>  $events
     * @param  array<int, EffectContract>  $effects
     */
    public function __construct(
        public string $channel,
        public ChannelVisibility $visibility,
        public array $events,
        public array $effects,
    ) {}

    /**
     * @return array{channel: string, visibility: string, events: list<string>, effects: array<int, EffectContract>}
     */
    public function jsonSerialize(): array
    {
        return [
            'channel' => $this->channel,
            'visibility' => $this->visibility->value,
            'events' => $this->events,
            'effects' => $this->effects,
        ];
    }
}

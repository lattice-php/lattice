<?php
declare(strict_types=1);

namespace Lattice\Lattice\Realtime;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Realtime\Enums\ChannelVisibility;

#[TypeScript]
final readonly class ListenerPayload
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
}

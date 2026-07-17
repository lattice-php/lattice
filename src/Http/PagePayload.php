<?php
declare(strict_types=1);

namespace Lattice\Lattice\Http;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Realtime\Listen;
use Lattice\Lattice\Ui\Components\Component;

/**
 * The `lattice` prop the server hydrates onto every Inertia page render. Holds
 * the live component tree; {@see Page::toArray()} realizes it eagerly through
 * Wire::toWire so serialization side effects fire inside the request.
 */
#[TypeScript]
final readonly class PagePayload
{
    /**
     * @param  array<int, Breadcrumb>  $breadcrumbs
     * @param  array<int, Component>  $schema
     * @param  array<int, Listen>|null  $listeners
     */
    public function __construct(
        public ?string $title,
        public ?PageLayoutPayload $layout,
        public string $container,
        public array $breadcrumbs,
        public array $schema,
        public ?array $listeners,
    ) {}
}

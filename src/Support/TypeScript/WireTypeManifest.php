<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

final readonly class WireTypeManifest
{
    /**
     * @param  list<class-string>  $enums
     * @param  list<class-string>  $valueObjects
     * @param  list<DiscoveredComponent>  $components
     * @param  array<class-string, string>  $effects
     */
    public function __construct(
        public array $enums,
        public array $valueObjects,
        public array $components,
        public array $effects,
    ) {}
}

<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

final readonly class DiscoveredComponent
{
    /**
     * @param  class-string  $class
     * @param  'component'|'field'|'column'  $category
     */
    public function __construct(
        public string $class,
        public string $type,
        public bool $container,
        public bool $interactive,
        public string $category,
    ) {}
}

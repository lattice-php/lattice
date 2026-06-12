<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

final readonly class DiscoveredComponent
{
    /**
     * @param  class-string  $class
     * @param  'component'|'field'|'column'  $category
     * @param  string  $domain  The namespace segment before `\Components\` (e.g. 'Core', 'Forms'), grouping the component into its Node union.
     */
    public function __construct(
        public string $class,
        public string $type,
        public bool $container,
        public bool $interactive,
        public string $category,
        public string $domain,
    ) {}
}

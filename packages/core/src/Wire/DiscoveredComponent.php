<?php
declare(strict_types=1);

namespace Lattice\Core\Wire;

final readonly class DiscoveredComponent
{
    /**
     * @param  class-string  $class
     * @param  string  $domain  Namespace segment before `\Components\` (e.g. 'Core'), grouping its components into a `…NodeType` union.
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

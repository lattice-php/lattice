<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

final readonly class DiscoveredComponent
{
    /**
     * @param  class-string  $class
     * @param  'component'|'field'|'column'  $category
     * @param  string  $domain  Namespace segment before `\Components\` (e.g. 'Core'), grouping it into its Node union.
     * @param  class-string|null  $propsClass
     */
    public function __construct(
        public string $class,
        public string $type,
        public bool $container,
        public bool $interactive,
        public string $category,
        public string $domain,
        public ?string $propsClass = null,
    ) {}
}

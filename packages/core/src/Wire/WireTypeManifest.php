<?php
declare(strict_types=1);

namespace Lattice\Core\Wire;

use UnitEnum;

final readonly class WireTypeManifest
{
    /**
     * @param  list<class-string<UnitEnum>>  $enums
     * @param  list<class-string>  $valueObjects
     * @param  list<DiscoveredComponent>  $components
     * @param  array<string, array<class-string, string>>  $families  attribute-sourced families: category => (class-string => wire type)
     */
    public function __construct(
        public array $enums,
        public array $valueObjects,
        public array $components,
        public array $families,
    ) {}

    /**
     * @return array<class-string, string>
     */
    public function family(string $category): array
    {
        return $this->families[$category] ?? [];
    }
}

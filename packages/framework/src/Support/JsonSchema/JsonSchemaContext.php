<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

/**
 * The name tables a schema fragment resolves against: class-string → `$defs`
 * key for enums/value objects/props, per-family concrete wire classes for
 * node references, and the abstract markers with their loose envelope defs.
 */
final readonly class JsonSchemaContext
{
    /**
     * @param  array<class-string, string>  $defNames
     * @param  array<string, array<class-string, string>>  $nodeDefs  family category => (concrete class => wire type)
     * @param  array<class-string, array{string, string}>  $markers  marker class => [family category, envelope def name]
     */
    public function __construct(
        public array $defNames = [],
        public array $nodeDefs = [],
        public array $markers = [],
    ) {}
}

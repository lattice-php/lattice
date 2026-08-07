<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

/**
 * The name tables a schema fragment resolves against: class-string → `$defs`
 * key for enums/value objects/props, per-family concrete wire classes for
 * node references, and the abstract markers with their loose envelope defs.
 *
 * Every def reference is a local `$defs` pointer, whether or not the def
 * belongs to the origin currently being built — `buildAll()`/
 * `buildRootDocument()` produce per-origin documents where a foreign pointer
 * is a valid pointer into the def universe, not the document itself;
 * `FlatProjection` resolves it into a self-contained artifact afterward.
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

    public function refFor(string $name): string
    {
        return '#/$defs/'.$name;
    }
}

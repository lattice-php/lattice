<?php
declare(strict_types=1);

namespace Lattice\Core\Wire;

/**
 * The name tables a wire model fragment resolves against: class-string →
 * `$defs` key for enums/value objects/props, per-family concrete wire
 * classes for node references, and the abstract markers with their loose
 * envelope defs.
 *
 * Every def reference is a local `$defs` pointer, whether or not the def
 * belongs to the origin currently being built — `buildAll()` produces
 * per-origin documents where a foreign pointer is a valid pointer into the
 * def universe, not necessarily resolvable within the document itself.
 */
final readonly class WireModelContext
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

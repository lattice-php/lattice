<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

/**
 * The name tables a schema fragment resolves against: class-string → `$defs`
 * key for enums/value objects/props, per-family concrete wire classes for
 * node references, and the abstract markers with their loose envelope defs.
 *
 * `defOrigins`/`schemaIds`/`currentOrigin` make `refFor()` cross-document
 * aware for `JsonSchemaBuilder::buildAll()`: a def outside the document
 * currently being built resolves to `{foreign $id}#/$defs/{name}` instead of
 * a local pointer. `currentOrigin === null` (the single-document
 * `JsonSchemaBuilder::build()` path) always resolves locally, ignoring
 * `defOrigins` entirely.
 */
final readonly class JsonSchemaContext
{
    /**
     * @param  array<class-string, string>  $defNames
     * @param  array<string, array<class-string, string>>  $nodeDefs  family category => (concrete class => wire type)
     * @param  array<class-string, array{string, string}>  $markers  marker class => [family category, envelope def name]
     * @param  array<string, string>  $defOrigins  def name (bare or `prefix:type`) => owning source's shortName
     * @param  array<string, string>  $schemaIds  source shortName => its document's `$id`
     */
    public function __construct(
        public array $defNames = [],
        public array $nodeDefs = [],
        public array $markers = [],
        public array $defOrigins = [],
        public array $schemaIds = [],
        public ?string $currentOrigin = null,
    ) {}

    public function refFor(string $name): string
    {
        if ($this->currentOrigin === null) {
            return '#/$defs/'.$name;
        }

        $origin = $this->defOrigins[$name] ?? $this->currentOrigin;

        return $origin === $this->currentOrigin ? '#/$defs/'.$name : $this->schemaIds[$origin].'#/$defs/'.$name;
    }
}

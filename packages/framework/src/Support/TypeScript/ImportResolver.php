<?php
declare(strict_types=1);

namespace Lattice\Support\TypeScript;

/**
 * The `WireModelBuilder::buildAll()`-produced def → origin map, resolved to
 * the npm module a cross-package `generated.ts` reference imports from.
 * `SchemaTypeScriptEmitter::emitPackageModule()`'s only source of "which
 * package owns this name" for a `$ref` the emitting document's own `$defs`
 * doesn't carry.
 */
final readonly class ImportResolver
{
    /**
     * @param  array<string, string>  $defOrigins  def name => `WireSource` short name
     */
    public function __construct(private array $defOrigins) {}

    public function originOf(string $name): ?string
    {
        return $this->defOrigins[$name] ?? null;
    }

    public function moduleFor(string $shortName): string
    {
        return '@lattice-php/'.$shortName;
    }
}

<?php
declare(strict_types=1);

namespace Lattice\Support\Wire;

/**
 * A single wire-contributing composer package: a component package that
 * declared `extra.lattice.discover`, or the composer ROOT package when it
 * does the same. `schemaId()` gives its wire document's stable `$id`.
 */
final readonly class WireSource
{
    /**
     * @param  list<string>  $dirs  absolute discover directories
     */
    public function __construct(
        public string $composerName,
        public string $shortName,
        public string $packageDir,
        public array $dirs,
        public bool $isRoot,
    ) {}

    public function schemaId(): string
    {
        return sprintf('https://lattice-php.dev/schema/%s/v1.json', $this->shortName);
    }
}

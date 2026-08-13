<?php
declare(strict_types=1);

namespace Lattice\Core\Wire;

/**
 * A single wire-contributing composer package: a component package that
 * declared `extra.lattice.discover`, or the composer ROOT package when it
 * does the same. Its committed schema document lives at `schemaPath()` under
 * `$id: schemaId()`.
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

    public function schemaPath(): string
    {
        return $this->packageDir.'/resources/schema/'.$this->shortName.'.schema.json';
    }
}

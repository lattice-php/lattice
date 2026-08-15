<?php
declare(strict_types=1);

namespace Lattice\Support\Packages;

final readonly class LatticePackageState
{
    public function __construct(
        public string $composerName,
        public string $npmName,
        public string $installedComposerVersion,
        public string $targetVersion,
        public bool $directComposerDependency,
        public ?string $composerSection,
        public bool $npmPublished,
        public ?string $installedNpmVersion,
        public ?string $npmSection,
    ) {}

    public function composerNeedsUpdate(): bool
    {
        return version_compare($this->installedComposerVersion, $this->targetVersion, '!=');
    }

    public function npmNeedsUpdate(): bool
    {
        return $this->npmPublished && $this->installedNpmVersion !== $this->targetVersion;
    }
}

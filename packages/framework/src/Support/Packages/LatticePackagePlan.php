<?php
declare(strict_types=1);

namespace Lattice\Support\Packages;

final readonly class LatticePackagePlan
{
    /**
     * @param  list<LatticePackageState>  $packages
     * @param  list<list<string>>  $composerCommands
     * @param  list<list<string>>  $npmCommands
     */
    public function __construct(
        public string $targetVersion,
        public array $packages,
        public array $composerCommands,
        public array $npmCommands,
        public bool $npmEnabled,
        public bool $publishAssets,
    ) {}

    public function hasChanges(): bool
    {
        return $this->composerCommands !== [] || $this->npmCommands !== [] || $this->publishAssets;
    }

    /** @return list<list<string>> */
    public function rows(): array
    {
        $rows = [];

        foreach ($this->packages as $package) {
            $rows[] = [
                'Composer',
                $package->composerName,
                $package->installedComposerVersion,
                $package->targetVersion,
                $package->composerNeedsUpdate() ? 'update' : 'current',
            ];

            if (! $this->npmEnabled || ! $package->npmPublished) {
                continue;
            }

            $rows[] = [
                'npm',
                $package->npmName,
                $package->installedNpmVersion ?? 'missing',
                $package->targetVersion,
                match (true) {
                    $package->installedNpmVersion === null => 'install',
                    $package->npmNeedsUpdate() => 'update',
                    default => 'current',
                },
            ];
        }

        if (! $this->npmEnabled) {
            $rows[] = [
                'Assets',
                'public Lattice bundle',
                $this->publishAssets ? 'stale or missing' : $this->targetVersion,
                $this->targetVersion,
                $this->publishAssets ? 'publish' : 'current',
            ];
        }

        return $rows;
    }

    /** @return list<string> */
    public function composerOnlyPackages(): array
    {
        if (! $this->npmEnabled) {
            return [];
        }

        return array_values(array_map(
            static fn (LatticePackageState $package): string => $package->composerName,
            array_filter($this->packages, static fn (LatticePackageState $package): bool => ! $package->npmPublished),
        ));
    }
}

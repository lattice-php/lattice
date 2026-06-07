<?php

declare(strict_types=1);

namespace Workbench\App\Support;

use Illuminate\Support\Collection;
use Laravel\Boost\Install\Skill;
use Laravel\Boost\Install\SkillComposer;

use function Orchestra\Testbench\package_path;

class BoostSkillComposer extends SkillComposer
{
    #[\Override]
    protected function discoverExplicitUserSkills(): Collection
    {
        $path = package_path('.ai/skills');

        if (! is_dir($path)) {
            return collect();
        }

        return collect(glob($path.DIRECTORY_SEPARATOR.'*', GLOB_ONLYDIR))
            ->map(fn (string $skillPath): ?Skill => $this->parseSkill($skillPath, 'user', custom: false))
            ->filter()
            ->keyBy(fn (Skill $skill): string => $skill->name);
    }

    #[\Override]
    protected function discoverPackageSpecificUserSkills(): Collection
    {
        $userAiPath = package_path('.ai');

        if (! is_dir($userAiPath)) {
            return collect();
        }

        return $this->discoverPackagePaths($userAiPath)
            ->flatMap(fn (array $package): Collection => $this->discoverSkillsFromPath(
                $package['path'],
                $package['name'],
                $package['version'],
            ));
    }
}

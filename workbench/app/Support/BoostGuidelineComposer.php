<?php

declare(strict_types=1);

namespace Workbench\App\Support;

use Laravel\Boost\Install\GuidelineComposer;

use function Orchestra\Testbench\package_path;

class BoostGuidelineComposer extends GuidelineComposer
{
    #[\Override]
    public function customGuidelinePath(string $path = ''): string
    {
        return package_path($this->userGuidelineDir.'/'.ltrim($path, '/'));
    }
}

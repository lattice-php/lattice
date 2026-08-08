<?php

declare(strict_types=1);

// Testbench's workbench.discovers.views config is not applied during Larastan's analysis-time app boot,
// so we must register the view path manually for PHPStan's view-string validation to find fixtures.
if (function_exists('app')) {
    $app = app();

    $viewFactory = $app->make('view');
    $finder = $viewFactory->getFinder();
    $currentPaths = $finder->getPaths();

    $workbenchViewPath = realpath(__DIR__.'/workbench/resources/views');

    if ($workbenchViewPath && ! in_array($workbenchViewPath, $currentPaths, true)) {
        $newPaths = $currentPaths;
        $newPaths[] = $workbenchViewPath;
        $finder->setPaths($newPaths);
    }
}

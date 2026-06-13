<?php
declare(strict_types=1);

use Rector\Config\RectorConfig;

return RectorConfig::configure()
    ->withPaths([
        __DIR__.'/src',
        __DIR__.'/tests',
        __DIR__.'/workbench/app',
        __DIR__.'/workbench/routes',
    ])
    ->withPhpSets(php83: true);

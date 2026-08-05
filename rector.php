<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\TypeDeclaration\Rector\FunctionLike\AddClosureParamTypeForArrayMapRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__.'/packages/action/src',
        __DIR__.'/packages/core/src',
        __DIR__.'/packages/form/src',
        __DIR__.'/packages/framework/src',
        __DIR__.'/packages/tree/src',
        __DIR__.'/packages/ui/src',
        __DIR__.'/tests',
        __DIR__.'/workbench/app',
        __DIR__.'/workbench/routes',
    ])
    ->withPhpSets(php84: true)
    ->withPreparedSets(
        deadCode: true,
        codeQuality: true,
        typeDeclarations: true,
    )
    ->withSkip([
        // Misinfers the array_map row callback as `int $original`, contradicting the
        // `is_array($original)` guard in Builder::castValue().
        AddClosureParamTypeForArrayMapRector::class => [
            __DIR__.'/packages/form/src/Components/Builder.php',
        ],
    ]);

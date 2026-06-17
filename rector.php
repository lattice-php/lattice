<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\TypeDeclaration\Rector\FunctionLike\AddClosureParamTypeForArrayMapRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__.'/src',
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
            __DIR__.'/src/Forms/Components/Builder.php',
        ],
    ]);

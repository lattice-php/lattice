<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\TypeDeclaration\Rector\ClassMethod\ObjectParamTypeByMethodCallTypeRector;
use Rector\TypeDeclaration\Rector\FuncCall\AddArrayFunctionClosureParamTypeRector;
use Rector\TypeDeclaration\Rector\FunctionLike\AddClosureParamTypeForArrayMapRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__.'/packages',
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
        // Adding the native `Model $model` hint back would re-widen the closure away from
        // the `TModel` generic PHPStan otherwise infers from `$models`, reintroducing the
        // level-8 finding the hint's removal was fixing. Two separate rules propose the
        // same reintroduction for different reasons, so both are skipped.
        AddArrayFunctionClosureParamTypeRector::class => [
            __DIR__.'/packages/tree/src/EloquentTreeSource.php',
        ],
        ObjectParamTypeByMethodCallTypeRector::class => [
            __DIR__.'/packages/tree/src/EloquentTreeSource.php',
        ],
    ]);

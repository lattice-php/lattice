<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\ParallelTesting;

/**
 * @template TReturn
 *
 * @param  Closure(string): TReturn  $callback
 * @return TReturn
 */
function withScaffoldWorkspace(Closure $callback): mixed
{
    $token = ParallelTesting::token() ?: 'default';
    $package = basename(dirname(__DIR__, 2));
    $basePath = sys_get_temp_dir().'/lattice-package-tests/'.$package.'/scaffold/test_'.$token;
    $originalBasePath = app()->basePath();
    $originalAppPath = app()->path();
    $originalDiscover = config('lattice.discover');
    $originalTypescriptOutput = config('lattice.typescript.output');

    try {
        File::deleteDirectory($basePath);
        app()->setBasePath($basePath);
        app()->useAppPath($basePath.'/app');

        config()->set('lattice.discover', [$basePath.'/app']);
        config()->set('lattice.typescript.output', $basePath.'/resources/js/lattice/generated.d.ts');

        File::ensureDirectoryExists($basePath.'/app');
        File::ensureDirectoryExists($basePath.'/resources/js/lattice');

        return $callback($basePath);
    } finally {
        app()->setBasePath($originalBasePath);
        app()->useAppPath($originalAppPath);

        config()->set('lattice.discover', $originalDiscover);
        config()->set('lattice.typescript.output', $originalTypescriptOutput);

        File::deleteDirectory($basePath);
    }
}

/**
 * @template TReturn
 *
 * @param  Closure(): TReturn  $callback
 * @return TReturn
 */
function withRegistryScaffold(Closure $callback): mixed
{
    return withScaffoldWorkspace(function () use ($callback): mixed {
        File::put(resource_path('js/registry.ts'), latticeRegistryStub());

        return $callback();
    });
}

function latticeRegistryStub(): string
{
    return <<<'TS'
import { createPlugin, extendRegistry, registry as packageRegistry } from "@lattice-php/lattice";

export const registry = extendRegistry(
  packageRegistry,
  createPlugin({
    name: "app",
    components: {},
    columns: {},
  }),
);

TS;
}

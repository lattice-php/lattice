<?php

declare(strict_types=1);

namespace Lattice\Tests;

use Lattice\Table\TableServiceProvider;
use Orchestra\Testbench\TestCase;

class StandalonePackagesTestCase extends TestCase
{
    /** @return array<int, class-string> */
    protected function getPackageProviders($app): array
    {
        return [TableServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('app.key', 'base64:'.base64_encode(random_bytes(32)));
        $app['config']->set('lattice.forms.middleware', []);
        $app['config']->set('lattice.tables.middleware', []);
        $app['config']->set('lattice.refs.middleware', []);
    }
}

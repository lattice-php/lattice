<?php

declare(strict_types=1);

use PHPUnit\Util\ExcludeList;

require __DIR__.'/../vendor/autoload.php';

// pest-plugin-browser removes its traces directory with a suppressed rmdir()
// that warns when the directory is gone, which the listing run of --shard has
// already deleted. PHPUnit ignores suppressed warnings only from excluded
// directories, so failOnWarning would fail a green suite. Remove once
// pestphp/pest-plugin-browser#278 is released.
ExcludeList::addDirectory(__DIR__.'/../vendor/pestphp/pest-plugin-browser');

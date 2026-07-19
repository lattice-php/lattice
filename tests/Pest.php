<?php

declare(strict_types=1);

use Lattice\Lattice\Tests\BrowserTestCase;
use Lattice\Lattice\Tests\TestCase;

require_once __DIR__.'/Support/Browser.php';
require_once __DIR__.'/Support/DocsFixtures.php';
require_once __DIR__.'/Support/Scaffolding.php';
require_once __DIR__.'/Support/TestFixtures.php';

uses(TestCase::class)->in('Feature');
uses(BrowserTestCase::class)->in('Browser');

<?php

declare(strict_types=1);

use Lattice\Tests\BrowserTestCase;
use Lattice\Tests\TestCase;

require_once __DIR__.'/Support/BoardFixtures.php';
require_once __DIR__.'/Support/Browser.php';
require_once __DIR__.'/Support/DocsFixtures.php';
require_once __DIR__.'/Support/MediaFixtures.php';
require_once __DIR__.'/Support/Scaffolding.php';
require_once __DIR__.'/Support/TestFixtures.php';
require_once __DIR__.'/Support/TreeFixtures.php';

uses(TestCase::class)->in('Feature');
uses(BrowserTestCase::class)->in('Browser');

<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Ui\Enums\PageLayout;

#[AsPage(layout: PageLayout::App, middleware: ['web'])]
abstract class WorkbenchPage extends Page {}

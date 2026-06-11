<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Http\Page;

abstract class WorkbenchPage extends Page
{
    public function layout(): PageLayout
    {
        return PageLayout::App;
    }

    public function container(): PageContainer
    {
        return PageContainer::Default;
    }
}

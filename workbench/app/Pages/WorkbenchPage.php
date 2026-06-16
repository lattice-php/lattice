<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Http\Page as BasePage;

#[AsPage(layout: PageLayout::App, container: PageContainer::Default, middleware: ['web', 'auth'])]
abstract class WorkbenchPage extends BasePage
{
    public function layout(): PageLayout|string|null
    {
        return session('workbench.chat_inline') ? 'app-chat' : null;
    }
}

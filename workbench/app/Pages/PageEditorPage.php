<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Blocks\Components\BlockEditor;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Enums\PageLayout;
use Lattice\Core\Enums\PageWidth;
use Lattice\Http\Page as BasePage;
use Lattice\Ui\PageSchema;
use Workbench\App\BlockEditors\PagesEditor;
use Workbench\App\Models\Page;

#[AsPage(route: '/pages/{page}/edit', layout: PageLayout::None, width: PageWidth::Full, middleware: ['web', 'auth'])]
final class PageEditorPage extends BasePage
{
    public function render(PageSchema $schema, Page $page): PageSchema
    {
        return $schema
            ->title($page->title)
            ->schema([
                BlockEditor::use(PagesEditor::class, ['page' => $page->getKey()]),
            ]);
    }
}

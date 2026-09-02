<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\Components\BlockView;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Breadcrumb;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Models\Page;

#[AsPage(route: '/pages/{page}')]
final class PageShowPage extends WorkbenchPage
{
    public function render(PageSchema $schema, Page $page): PageSchema
    {
        return $schema
            ->title($page->title)
            ->breadcrumbs([
                Breadcrumb::toPage(PagesPage::class)->title(__('workbench.blocks.pages.title')),
                Breadcrumb::toPage(self::class, ['page' => $page->getKey()])->title($page->title),
            ])
            ->schema([
                Stack::make('page-show')->gap(Gap::Large)->schema([
                    BlockView::document($page->published ?? $page->draft ?? BlockDocument::empty(), 'page-content'),
                ]),
            ]);
    }
}

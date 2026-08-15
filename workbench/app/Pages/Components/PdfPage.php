<?php

declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Core\Attributes\AsPage;
use Lattice\Pdf\Components\PdfViewer;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\PageSchema;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/pdf')]
final class PdfPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.navigation.pdf');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('pdf-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.pdf.heading')),
                    Text::make(__('workbench.pages.pdf.description')),
                    PdfViewer::make('sample')
                        ->url(fn (): string => url('/fixtures/sample.pdf'))
                        ->filename('sample.pdf')
                        ->height(640),
                ]),
        ]);
    }
}

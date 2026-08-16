<?php

declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsPage;
use Lattice\Pdf\Components\PdfViewer;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\ModalWidth;
use Lattice\Ui\PageSchema;
use Workbench\App\Actions\OpenPdfModalAction;
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
                    Action::use(OpenPdfModalAction::class),
                    PdfViewer::make('sample')
                        ->url(fn (): string => url('/fixtures/sample.pdf'))
                        ->filename('sample.pdf')
                        ->maxHeight(720),
                    Modal::make('pdf-document-modal')
                        ->title(__('workbench.pages.pdf.modal.title'))
                        ->width(ModalWidth::Xl)
                        ->schema([
                            PdfViewer::make('modal-sample')
                                ->url(fn (): string => url('/fixtures/sample.pdf'))
                                ->filename('sample.pdf')
                                ->sidebar(false)
                                ->height(560),
                        ]),
                ]),
        ]);
    }
}

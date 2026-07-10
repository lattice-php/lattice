<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\Align;
use Lattice\Lattice\Ui\Enums\Gap;

#[AsPage(route: '/uploads', name: 'uploads.index')]
class UploadsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.uploads.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('uploads-page')
                ->gap(Gap::Large)
                ->schema([
                    Stack::make('uploads-header')
                        ->direction('row')
                        ->align(Align::Center)
                        ->schema([
                            Heading::make(__('workbench.pages.uploads.heading')),
                            Button::make(__('workbench.pages.uploads.create'), 'create-upload')
                                ->href('/uploads/create'),
                        ]),
                ]),
        ]);
    }
}

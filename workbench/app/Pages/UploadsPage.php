<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;

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

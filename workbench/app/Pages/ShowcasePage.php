<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\ShowcaseForm;

#[Page(route: '/showcase')]
class ShowcasePage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.showcase.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('showcase-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.showcase.heading')),
                    Form::use(ShowcaseForm::class)
                        ->method(HttpMethod::Post),
                ]),
        ]);
    }
}

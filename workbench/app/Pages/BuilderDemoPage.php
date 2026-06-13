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
use Workbench\App\Forms\BuilderDemoForm;

#[Page(route: '/builder')]
class BuilderDemoPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.builder.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('builder-demo-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.builder.heading')),
                    Form::use(BuilderDemoForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel(__('workbench.pages.builder.submit')),
                ]),
        ]);
    }
}

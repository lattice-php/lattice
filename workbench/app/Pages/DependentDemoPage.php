<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\Gap;
use Workbench\App\Forms\DependentDemoForm;

#[AsPage(route: '/dependent-demo', name: 'dependent.demo')]
class DependentDemoPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.dependent.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('dependent-demo-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.dependent.heading')),
                    Form::use(DependentDemoForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel(__('workbench.pages.dependent.submit')),
                ]),
        ]);
    }
}

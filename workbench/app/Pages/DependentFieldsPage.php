<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Core\Attributes\AsPage;
use Lattice\Form\Components\Form;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\Gap;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\PageSchema;
use Workbench\App\Forms\DependentFieldsForm;

#[AsPage(route: '/form/dependent', name: 'form.dependent')]
class DependentFieldsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.dependent.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('dependent-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make($this->title()),
                    Text::make(__('workbench.pages.dependent.description')),
                    Form::use(DependentFieldsForm::class)->method(HttpMethod::Post),
                ]),
        ]);
    }
}

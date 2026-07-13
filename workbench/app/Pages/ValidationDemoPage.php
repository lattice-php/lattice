<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Gap;
use Workbench\App\Forms\ValidationDemoForm;

#[AsPage(route: '/form/validation', name: 'form.validation')]
class ValidationDemoPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.validation.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('validation-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make($this->title()),
                    Text::make(__('workbench.pages.validation.description')),
                    Form::use(ValidationDemoForm::class)->method(HttpMethod::Post),
                ]),
        ]);
    }
}

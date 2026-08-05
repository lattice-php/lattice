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
use Workbench\App\Forms\CheckoutWizardForm;

#[AsPage(route: '/form/wizard', name: 'form.wizard')]
class WizardPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.wizard.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('wizard-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make($this->title()),
                    Text::make(__('workbench.pages.wizard.description')),
                    Form::use(CheckoutWizardForm::class)->method(HttpMethod::Post),
                ]),
        ]);
    }
}

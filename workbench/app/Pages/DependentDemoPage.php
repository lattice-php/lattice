<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Workbench\App\Forms\DependentDemoForm;

class DependentDemoPage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Dependent Demo';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('dependent-demo-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make('Dependent Demo'),
                    Form::use(DependentDemoForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel('Save'),
                ]),
        ]);
    }
}

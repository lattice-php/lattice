<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Bambamboole\Lattice\Components\Core\Heading;
use Bambamboole\Lattice\Components\Core\Stack;
use Bambamboole\Lattice\Components\Form\Form;
use Bambamboole\Lattice\Enums\Gap;
use Bambamboole\Lattice\Enums\HttpMethod;
use Bambamboole\Lattice\Page;
use Bambamboole\Lattice\PageSchema;
use Workbench\App\Forms\DependentDemoForm;

class WorkbenchDependentDemoPage extends Page
{
    public function title(): string
    {
        return 'Dependent Demo';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->components([
            Stack::make('dependent-demo-page')
                ->gap(Gap::Large)
                ->children([
                    Heading::make('Dependent Demo'),
                    Form::use(DependentDemoForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel('Save'),
                ]),
        ]);
    }
}

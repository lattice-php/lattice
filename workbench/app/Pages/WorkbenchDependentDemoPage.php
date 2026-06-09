<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Bambamboole\Lattice\Core\Components\Heading;
use Bambamboole\Lattice\Core\Components\Stack;
use Bambamboole\Lattice\Core\Enums\Gap;
use Bambamboole\Lattice\Core\Enums\HttpMethod;
use Bambamboole\Lattice\Core\PageSchema;
use Bambamboole\Lattice\Forms\Components\Form;
use Bambamboole\Lattice\Http\Page;
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

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
use Workbench\App\Forms\RepeaterDemoForm;

#[Page(route: '/repeater')]
class RepeaterDemoPage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Repeater Demo';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('repeater-demo-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make('Repeater Demo'),
                    Form::use(RepeaterDemoForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel('Save'),
                ]),
        ]);
    }
}

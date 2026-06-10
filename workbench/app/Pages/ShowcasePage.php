<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Http\Page;
use Workbench\App\Forms\ShowcaseForm;

class ShowcasePage extends Page
{
    public function title(): string
    {
        return 'Form Showcase';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->components([
            Stack::make('showcase-page')
                ->gap(Gap::Large)
                ->children([
                    Heading::make('Form Showcase'),
                    Form::use(ShowcaseForm::class)
                        ->method(HttpMethod::Post),
                ]),
        ]);
    }
}

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
use Workbench\App\Forms\ProductForm;

class WorkbenchProductCreatePage extends Page
{
    public function title(): string
    {
        return 'Create Product';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->components([
            Stack::make('product-create-page')
                ->gap(Gap::Large)
                ->children([
                    Heading::make('Create Product'),
                    Form::use(ProductForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel('Create product'),
                ]),
        ]);
    }
}

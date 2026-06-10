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
use Workbench\App\Forms\ProductForm;

class ProductCreatePage extends Page
{
    public function title(): string
    {
        return 'Create Product';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('product-create-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make('Create Product'),
                    Form::use(ProductForm::class)
                        ->method(HttpMethod::Post)
                        ->submitLabel('Create product'),
                ]),
        ]);
    }
}
